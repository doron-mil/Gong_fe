import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatBottomSheet, MatCheckbox, MatDialog, MatMenuTrigger, MatTree, MatTreeNestedDataSource} from '@angular/material';
import {NestedTreeControl} from '@angular/cdk/tree';
import {fromEvent} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import * as _ from 'lodash';

import {NameEditDialogComponent} from '../../dialogs/name-edit-dialog/name-edit-dialog.component';
import {LanguageProperties, NotificationTypesEnum} from '../../model/data.model';
import {langPropsArray as knownLanguages} from './known-languages';
import {MessagesComponent} from '../../dialogs/messages/messages.component';
import {BasicNode, NewNodeDialogComponent} from '../../dialogs/new-node-dialog/new-node-dialog.component';

// https://www.google.com/search?q=json+representation+in+typescript&oq=json+representation+in+ty&aqs=chrome.1.69i57j33l2.21951j0j7&sourceid=chrome&ie=UTF-8

// https://github.com/ngx-translate/core

// https://www.google.com/search?q=typescript+json+iterate&oq=typescript+json+it&aqs=chrome.1.69i57j0l3j69i60l2.10887j0j7&sourceid=chrome&ie=UTF-8

// https://www.google.com/search?q=typescript+multiple+object+type&oq=typescript+multiple+ob&aqs=chrome.1.69i57j0l5.17175j0j7&sourceid=chrome&ie=UTF-8
// typescriptlang.org/docs/handbook/advanced-types.html
//

const MAX_NO_LANGUAGES_4_EDITING = 2;

const KNOWN_LANGS_ABBR_ARRAY = [''];

const ENGLISH_CODE = 'en';

enum SearchByEnum {
  PROBLEM = 'PROBLEM',
  TEXT = 'TEXT',
}

enum ProblemType {
  NONE,
  MISS_MATCH_PROBLEM,
  NOT_EXIST_ON_EN,
  NOT_EXIST_ON_OTHER_LANG,
}

class JsonNode {
  id: string;
  key: string;
  value: { [key: string]: string } | JsonNode[];
  hasChildren: boolean;
  fullPath: string;
  maxKeyLength4Level: number;
  problemType = ProblemType.NONE;
  parent: JsonNode;

  children = (): JsonNode[] => this.hasChildren ? this.value as JsonNode[] : null;
}

@Component({
  selector: 'app-json-editor',
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.css']
})
export class JsonEditorComponent implements OnInit, AfterViewInit {

  @Input() languagesMap: Map<string, any>;

  @Input() translateMethod: (sourceStrings: Array<string>, targetLang: string) => (Promise<Array<string>>);

  @Output() outputMessages = new EventEmitter<NotificationTypesEnum>();

  @Output() languagesMapOutput = new EventEmitter<Map<string, any>>();

  @ViewChild('searchTextInput') searchTextInput: ElementRef;

  @ViewChild('tree') tree: MatTree<JsonNode>;

  wasLangLoadedOk: boolean;

  treeControl = new NestedTreeControl<JsonNode>(node => node.children());
  dataSource = new MatTreeNestedDataSource<JsonNode>();
  data: JsonNode[];

  maxNoLanguages4Editing = MAX_NO_LANGUAGES_4_EDITING;
  knownLangsArray: Array<LanguageProperties>;
  languages4EditingArray: Array<LanguageProperties>;

  problemType = ProblemType;

  searchCounter = -1;
  searchByOptions = SearchByEnum;
  searchBy: SearchByEnum = SearchByEnum.PROBLEM;
  searchText = '';
  searchBufferObjectMap: { [key: string]: Array<JsonNode> } = {};  // Only one item representing
  foundObjectID: string;

  // current search

  constructor(private dialog: MatDialog, private bottomSheet: MatBottomSheet) {
    this.constructKnownLangsArray();
  }

  ngOnInit() {
    this.wasLangLoadedOk = this.constructLanguagesDataStructure();

    this.dataSource.data = this.data;
    this.treeControl.dataNodes = this.data;
  }

  ngAfterViewInit() {
    this.listenToSearchTextChange();
  }

  private constructLanguagesDataStructure(): boolean {
    this.languages4EditingArray = [];

    const englishJson = this.languagesMap.get('en');
    if (!englishJson) {
      return false;
    }

    // First load the english
    this.data = this.convertJsonIntoJsonNode(englishJson, 'en');
    let langProperty = this.knownLangsArray.find(languageProperties => languageProperties.lang === 'en');
    langProperty.isPreLoaded = true;
    langProperty.isDisplayed = true;
    this.languages4EditingArray.push(langProperty);

    // Now load the other languages
    this.languagesMap.forEach((langJson: any, lang: string) => {
      if (lang !== 'en') {
        this.loadAnotherLanguage(this.data, langJson, lang);
        langProperty = this.knownLangsArray.find(languageProperties => languageProperties.lang === lang);
        if (!langProperty) {
          langProperty = new LanguageProperties('Customized', lang);
          langProperty.isCustomized = true;
          this.knownLangsArray.push(langProperty);
        }
        langProperty.isPreLoaded = true;
        langProperty.isDisplayed = true;
        this.languages4EditingArray.push(langProperty);
      }
    });

    this.search4AdditionalProblems(this.data);

    return true;
  }

  hasChild = (_: number, node: JsonNode) => !!node.hasChildren;

  private listenToSearchTextChange() {
    fromEvent(this.searchTextInput.nativeElement, 'keyup').pipe(
      // get value
      map((event: any) => {
        return event.target.value;
      })
      // if character length greater then 2
      , filter(res => res.length > 2)
      // Time in milliseconds between key events
      , debounceTime(1000)
      // If previous query is diffent from current
      , distinctUntilChanged()
      // subscription for response
    ).subscribe((newSearchText: string) => {
      this.searchTextChanged(newSearchText);
    });
  }

  private convertJsonIntoJsonNode(aJsonObj: { [key: string]: string | any },
                                  aLang: string,
                                  aParent: JsonNode = null): JsonNode[] {
    const retJsonNodeArray: JsonNode[] = [];
    let maxKeyLen = 0;
    Object.entries(aJsonObj).forEach((objectItem: Array<any>, index) => {

      const key = objectItem[0] as string;
      const value = objectItem[1];

      const newJsonNode = this.createJsonNodeFromKeyValue(index, key, value, aLang, aParent);
      maxKeyLen = !newJsonNode.hasChildren ? Math.max(maxKeyLen, key.length) : maxKeyLen;

      retJsonNodeArray.push(newJsonNode);
    });
    retJsonNodeArray.forEach(jsonNode => jsonNode.maxKeyLength4Level = maxKeyLen);
    return retJsonNodeArray;
  }


  private createJsonNodeFromKeyValue(
    aIndex: number, aKey: string, aValue: string | any, aLang: string, aParent: JsonNode = null): JsonNode {
    const newJsonNode = new JsonNode();

    newJsonNode.key = aKey;
    newJsonNode.id = `${aParent ? aParent.id + '.' : ''}${aIndex}`;
    newJsonNode.fullPath = `${aParent ? aParent.fullPath + '.' : ''}${aKey}`;
    const hasChildren = !_.isString(aValue);
    newJsonNode.hasChildren = hasChildren;
    newJsonNode.parent = aParent;
    newJsonNode.value = (!hasChildren) ? {[aLang]: aValue} : this.convertJsonIntoJsonNode(aValue, aLang, newJsonNode);

    return newJsonNode;
  }

  private loadAnotherLanguage(aBaseDataModelArray: JsonNode[], aJsonObj: { [key: string]: string | any }, aLang: string) {
    const jsonNodeObjectMap: { [key: string]: JsonNode } = aBaseDataModelArray.reduce((retObjectMap: any, currentValue: JsonNode) => {
      retObjectMap[currentValue.key] = currentValue;
      return retObjectMap;
    }, {});
    Object.entries(aJsonObj).forEach((objectItem: Array<any>) => {
      const key = objectItem[0] as string;
      const foundJsonNode = jsonNodeObjectMap[key];
      const value = objectItem[1];
      const hasChildren = !_.isString(value);
      if (foundJsonNode) {
        if (foundJsonNode.hasChildren === hasChildren) {
          if (hasChildren) {
            this.loadAnotherLanguage(foundJsonNode.children(), value, aLang);
          } else {
            foundJsonNode.value[aLang] = value;
          }

        } else {
          foundJsonNode.problemType = ProblemType.MISS_MATCH_PROBLEM;
        }
      } else {
        const currentFirstItem = aBaseDataModelArray[0];
        const currentFirstItemPath = currentFirstItem.fullPath;
        const currentFirstItemParent = currentFirstItem.parent;
        const lastPointIndex = currentFirstItemPath.lastIndexOf('.');
        const newJsonNode = this.createJsonNodeFromKeyValue(aBaseDataModelArray.length, key, value, aLang, currentFirstItemParent);
        newJsonNode.problemType = ProblemType.NOT_EXIST_ON_EN;
        aBaseDataModelArray.push(newJsonNode);
      }
    });
  }

  getMaxLabelWidth(aNode: JsonNode): string {
    const maxLen = aNode.maxKeyLength4Level;
    let retWidth;
    if (maxLen < 10) {
      retWidth = '10vw';
    } else if (maxLen < 25) {
      retWidth = '13vw';
    } else {
      retWidth = '25vw';
    }
    return retWidth;
  }

  collapseAll() {
    // this.tree.treeControl.collapseAll()
    this.treeControl.collapseAll();
  }

  expandAll() {
    this.treeControl.expandAll();
  }

  private search4AdditionalProblems(aData: JsonNode[]) {
    const langArray = this.languages4EditingArray.filter(langObj => langObj.lang !== 'en').map(langObj => langObj.lang);
    aData.forEach(jsonNodeObj => {
      if (!jsonNodeObj.hasChildren && jsonNodeObj.problemType === ProblemType.NONE) {
        const notTrans = langArray.some(lang => !jsonNodeObj.value[lang] || jsonNodeObj.value[lang] === '');
        jsonNodeObj.problemType = notTrans ? ProblemType.NOT_EXIST_ON_OTHER_LANG : ProblemType.NONE;
      } else if (jsonNodeObj.hasChildren) {
        this.search4AdditionalProblems(jsonNodeObj.children());
      }
    });

  }

  getProblemText(aProblemType: ProblemType): string {
    let retProblemTest = '';
    switch (aProblemType) {
      case ProblemType.MISS_MATCH_PROBLEM:
        retProblemTest = 'Mismatch in types of clauses between languages';
        break;
      case ProblemType.NOT_EXIST_ON_EN:
        retProblemTest = 'Clause found on other languages than English';
        break;
      case ProblemType.NOT_EXIST_ON_OTHER_LANG:
        retProblemTest = 'Clause not found on some other languages than English';
        break;

    }

    return retProblemTest;
  }

  editNodeName(aNode: JsonNode) {
    const dialogRef = this.dialog.open(NameEditDialogComponent, {
      position: {top: '25vh', left: '25vw'},
      height: '30vh',
      width: '50vw',
      data: {initialKeyName: aNode.key},
    });

    dialogRef.afterClosed().subscribe((aNewKeyName: string) => {
      if (aNewKeyName) {
        aNode.key = aNewKeyName;
        this.setNodeFullPath(aNode);
      }
    });

    this.reRenderTree();
  }

  editNodePath(aNode: JsonNode) {
    console.log('1111', aNode);
  }

  deleteNode(aNode: JsonNode) {
    const bottomSheetRef = this.bottomSheet.open(MessagesComponent, {
      data: {message: `Aru you sure about deleting ${aNode.key} node?`, submitText: 'Delete', cancelText: 'Cancel'}
    });
    bottomSheetRef.afterDismissed().subscribe(dialogResult => {
      if (dialogResult) {
        const parentChildrenArray = aNode.parent ? aNode.parent.children() : this.data;
        const res = _.remove(parentChildrenArray, (jsonNode: JsonNode) => jsonNode.id === aNode.id);

        this.reRenderTree();
      }
    });

  }

  addChildNode(aNode: JsonNode, aIsContainer: boolean = true) {
    const siblingsKeyNamesArray = aNode.children().map((jsonNode: JsonNode) => jsonNode.key);
    const dialogRef = this.dialog.open(NewNodeDialogComponent, {
      height: '80vh',
      width: '50vw',
      data: {siblingsKeyNamesArray, handledLang: aIsContainer ? null : this.languages4EditingArray},
    });

    dialogRef.afterClosed().subscribe((aNewNodeBasicData: BasicNode) => {
      if (aNewNodeBasicData) {
        const newJsonNode = new JsonNode();
        newJsonNode.key = aNewNodeBasicData.key;
        newJsonNode.hasChildren = aIsContainer;
        if (aIsContainer) {
          newJsonNode.value = [];
        } else {
          newJsonNode.value = aNewNodeBasicData.value;
        }

        newJsonNode.parent = aNode;
        this.setNodeFullPath(newJsonNode);
        this.setNewNodeId(newJsonNode);
        aNode.children().push(newJsonNode);

        this.treeControl.expand(aNode);
        this.reRenderTree();
      }
    });
  }

  private reRenderTree() {
    this.dataSource.data = null;
    this.dataSource.data = this.data;
  }

  private setNodeFullPath(aNode: JsonNode) {
    if (aNode.parent) {
      aNode.fullPath = `${aNode.parent.fullPath}.${aNode.key}`;
    } else {
      aNode.fullPath = aNode.key;
    }

    if (aNode.hasChildren) {
      aNode.children().forEach((jsonNode: JsonNode) => this.setNodeFullPath(jsonNode));
    }
  }

  // TO DO - tie loose hands for Id
  private setNewNodeId(aNode: JsonNode) {
    if (aNode.parent) {
      aNode.id = `${aNode.parent.id}.1`;
    } else {
      aNode.id = '111'; // TO DO **************
    }

    if (aNode.hasChildren) {
      aNode.children().forEach((jsonNode: JsonNode) => this.setNewNodeId(jsonNode));
    }
  }

  onSearchBySelectedChange() {
    this.searchText = '';
    this.foundObjectID = '';
    this.searchCounter = -1;
  }

  searchNextOrPrev(aIsNext: boolean = true) {
    if (this.searchBy === SearchByEnum.PROBLEM && this.searchCounter < 0) {
      this.getSearchBufferForProblem();
    }

    this.recalculateSearchCounter(aIsNext);
    this.scrollNode2View(aIsNext);
  }

  private recalculateSearchCounter(aIsNext: boolean) {
    const valuesArray = Object.values(this.searchBufferObjectMap);
    const searchCount = (valuesArray && valuesArray.length > 0) ? valuesArray[0].length : 0;

    if (searchCount > 0) {
      const step = aIsNext ? 1 : -1;
      this.searchCounter += step;
      const isInRange = _.inRange(this.searchCounter, 0, searchCount);
      this.searchCounter = isInRange ? this.searchCounter : (this.searchCounter < 0 ? searchCount - 1 : 0);
    } else {
      this.searchCounter = -1;
    }
  }

  searchTextChanged(aSearchText: string) {
    this.searchText = aSearchText;
    this.searchCounter = 0;
    const searchBufferForText = this.getSearchBufferForText();
    this.scrollNode2View();

  }

  scrollNode2View(aIsNext: boolean = true) {
    const searchBufferForText = Object.values(this.searchBufferObjectMap)[0];
    if (searchBufferForText && searchBufferForText.length > 0) {
      const nodeToFocusOn = searchBufferForText[this.searchCounter];
      this.expandNode(nodeToFocusOn);
      setTimeout(() => {
        const el = document.getElementById(nodeToFocusOn.id);
        if (el) {
          el.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
          this.foundObjectID = nodeToFocusOn.id;
        }
      }, 0);
    } else {
      this.notifyParent(NotificationTypesEnum.NOT_FOUND_SEARCH_OBJECT);
    }
  }

  private expandNode(aJsonNode: JsonNode) {
    if (aJsonNode.parent) {
      this.expandNode(aJsonNode.parent);
    }
    this.treeControl.expand(aJsonNode);
  }

  private getSearchBufferForProblem(): JsonNode[] {
    return this.getSearchBuffer(SearchByEnum.PROBLEM, (jsonNode: JsonNode) => jsonNode.problemType !== ProblemType.NONE);
  }

  private getSearchBufferForText(): JsonNode[] {
    return this.getSearchBuffer(this.searchText, this.checkForText.bind(this));
  }

  private getSearchBuffer(aBufferId: string, aCheckFunc: (JsonNode) => boolean): JsonNode[] {
    let searchBuffer = this.searchBufferObjectMap[aBufferId] as JsonNode[];
    if (!searchBuffer) {
      this.searchBufferObjectMap = {};
      searchBuffer = new Array<JsonNode>();
      this.accumulateFoundNodes(this.data, searchBuffer, aCheckFunc);
      this.searchBufferObjectMap[aBufferId] = searchBuffer;
    }
    return searchBuffer;
  }


  private accumulateFoundNodes(aData: JsonNode[], aFoundNodesArray: JsonNode[], aCheckFunc: (JsonNode) => boolean) {
    _.forEach(aData, (jsonNodeObject: JsonNode) => {
      const checkFuncReyValue = aCheckFunc(jsonNodeObject);
      if (checkFuncReyValue) {
        aFoundNodesArray.push(jsonNodeObject);
      }

      if (jsonNodeObject.hasChildren) {
        this.accumulateFoundNodes(jsonNodeObject.children(), aFoundNodesArray, aCheckFunc);
      }
    });
  }

  private checkForText(aJsonNode: JsonNode): boolean {
    let retIsValid4Search = false;
    if (aJsonNode.key.indexOf(this.searchText) >= 0) {
      retIsValid4Search = true;
    } else if (!aJsonNode.hasChildren) {
      retIsValid4Search = this.languages4EditingArray.some((langObj: { lang: string }) => {
        const value = aJsonNode.value[langObj.lang] as string;
        return (value && value.indexOf(this.searchText) >= 0);
      });
    }
    return retIsValid4Search;
  }

  private notifyParent(aNotificationTypesEnum: NotificationTypesEnum) {
    this.outputMessages.emit(aNotificationTypesEnum);
  }

  private constructKnownLangsArray() {
    this.knownLangsArray = knownLanguages.sort((a, b) => a.abbreviation.localeCompare(b.abbreviation)).map(jsonItem =>
      new LanguageProperties(jsonItem.name, jsonItem.abbreviation, jsonItem.isRtl));
  }

  selectLangChange(aLanguageProperties: LanguageProperties, aIsChecked: boolean) {
    aLanguageProperties.isAdded = aIsChecked;
    if (aIsChecked) {
      aLanguageProperties.isDisplayed = true;
      this.languages4EditingArray.push(aLanguageProperties);

    } else {
      aLanguageProperties.isDisplayed = false;
      _.remove(this.languages4EditingArray, langProperties => langProperties.lang === aLanguageProperties.lang);
    }
  }

  getTranslationMethod() {
    return this.translateEnTo.bind(this);
  }

  getCopyMethod() {
    return this.copyEnTo.bind(this);
  }

  translateEnTo(aLanguageProperties: LanguageProperties) {
    this.convertEn(this.data, aLanguageProperties, NotificationTypesEnum.TRANSLATION_COMPLETE, this.translateMethod);
  }

  copyEnTo(aLanguageProperties: LanguageProperties) {
    const copyMethod = (sourceStrings: Array<string>, lang: string): Promise<Array<string>> => {
      const copiedValues = sourceStrings.map(sourceString => sourceString);
      return new Promise<Array<string>>((resolve, reject) => {
        resolve(copiedValues);
      });
    };
    this.convertEn(this.data, aLanguageProperties, NotificationTypesEnum.ENGLISH_COPY_COMPLETE, copyMethod);
  }

  private convertEn(aData: JsonNode[], aLanguageProperties: LanguageProperties, aMessagesEnum: NotificationTypesEnum,
                    aConversionMethod: (sourceStrings: Array<string>, targetLang: string) => Promise<Array<string>>) {
    const nodesForConversionArray = [];
    this.getNodesForConversion(this.data, aLanguageProperties, nodesForConversionArray);

    const englishValuesArray = nodesForConversionArray.map(jsonNode => jsonNode.value[ENGLISH_CODE]);

    aConversionMethod(englishValuesArray, aLanguageProperties.lang).then(retValuesArray => {
      let counter = 0;
      nodesForConversionArray.forEach(jsonNode => {
        jsonNode.value[aLanguageProperties.lang] = retValuesArray[counter];
        counter += 1;
      });
      this.notifyParent(aMessagesEnum);
    });
  }

  private getNodesForConversion(aData: JsonNode[], aLanguageProperties: LanguageProperties, aNodesForConversionArray: JsonNode[]) {
    aData.forEach(jsonNode => {
      if (jsonNode.hasChildren) {
        this.getNodesForConversion(jsonNode.children(), aLanguageProperties, aNodesForConversionArray);
      } else {
        if (_.isNil(jsonNode.value[aLanguageProperties.lang])) {
          aNodesForConversionArray.push(jsonNode);
        }
      }
    });
  }

  refreshProblems() {

  }

  upload() {
    const languagesMap = new Map<string, any>();
    const languagesUtilsObjectMap: { [key: string]: any } = {};

    this.languages4EditingArray.forEach((langProperties: LanguageProperties) => {
      const newJson4Lang = {};
      languagesMap.set(langProperties.lang, newJson4Lang);
      languagesUtilsObjectMap[langProperties.lang] = newJson4Lang;
    });

    this.convertDataToJsonObjects(this.data, languagesUtilsObjectMap);

    this.languagesMapOutput.emit(languagesMap);
  }

  private convertDataToJsonObjects(aSourceJsonNodeArray: JsonNode[], aLangObjectMap: { [key: string]: any }) {
    aSourceJsonNodeArray.forEach(jsonNode => {
      const key = jsonNode.key;
      if (jsonNode.hasChildren) {
        this.convertDataToJsonObjects(jsonNode.children(), aLangObjectMap);
      } else {
        this.languages4EditingArray.forEach((langProperties: LanguageProperties) => {
          const lang = langProperties.lang;
          _.set(aLangObjectMap[lang], jsonNode.fullPath, jsonNode.value[lang]);
        });
      }
    });
  }

  handleLangSelectMenuChange(aMatCheckBox: MatCheckbox, aLangSelectTrigger: MatMenuTrigger) {
    // console.log(aMatCheckBox.checked, aMatCheckBox, aLangSelectTrigger);
    // if (aMatCheckBox.checked) {
    // } else {
    //   setTimeout(() => aLangSelectTrigger.closeMenu(), 500);
    // }
  }
}