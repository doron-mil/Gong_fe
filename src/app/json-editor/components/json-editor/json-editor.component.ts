import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatDialog} from '@angular/material/dialog';
import {MatMenuTrigger} from '@angular/material/menu';
import {MatTree, MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import {fromEvent} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import * as _ from 'lodash';

import {NameEditDialogComponent} from '../../dialogs/name-edit-dialog/name-edit-dialog.component';
import {LanguageProperties, NotificationTypesEnum} from '../../shared/dataModels/lang.model';
import {langPropsArray as knownLanguages} from './known-languages';
import {MessagesComponent} from '../../dialogs/messages/messages.component';
import {BasicNode, NewNodeDialogComponent} from '../../dialogs/new-node-dialog/new-node-dialog.component';
import {JsonTreeComponent} from '../json-tree/json-tree.component';
import {JsonNode, ProblemType, SearchByEnum, TreeNotificationTypesEnum} from '../../shared/dataModels/tree.model';

// https://www.google.com/search?q=json+representation+in+typescript&oq=json+representation+in+ty&aqs=chrome.1.69i57j33l2.21951j0j7&sourceid=chrome&ie=UTF-8

// https://github.com/ngx-translate/core

// https://www.google.com/search?q=typescript+json+iterate&oq=typescript+json+it&aqs=chrome.1.69i57j0l3j69i60l2.10887j0j7&sourceid=chrome&ie=UTF-8

// https://www.google.com/search?q=typescript+multiple+object+type&oq=typescript+multiple+ob&aqs=chrome.1.69i57j0l5.17175j0j7&sourceid=chrome&ie=UTF-8
// typescriptlang.org/docs/handbook/advanced-types.html
//

const MAX_NO_LANGUAGES_4_EDITING = 2;

const KNOWN_LANGS_ABBR_ARRAY = [''];

const ENGLISH_CODE = 'en';


@Component({
  selector: 'app-json-editor',
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.scss'],
})
export class JsonEditorComponent implements OnInit, AfterViewInit {

  @Input() languagesMap: Map<string, any>;

  @Input() allowNodesMenu: boolean = true;
  @Input() readonlyLanguages: string[] = [];

  @Input() translateMethod: (sourceStrings: Array<string>, targetLang: string) => (Promise<Array<string>>);

  @Output() outputMessages = new EventEmitter<NotificationTypesEnum>();

  @Output() languagesMapOutput = new EventEmitter<Map<string, any>>();

  @ViewChild(JsonTreeComponent, {static: false}) treeComponent: JsonTreeComponent;
  @ViewChild('searchTextInput', {static: false}) searchTextInput: ElementRef;

  foundObjectID: string;

  wasLangLoadedOk: boolean = false;


  maxNoLanguages4Editing = MAX_NO_LANGUAGES_4_EDITING;
  knownLangsArray: Array<LanguageProperties>;


  searchCounter = -1;
  searchByOptions = SearchByEnum;
  searchBy: SearchByEnum = SearchByEnum.PROBLEM;
  searchText = '';
  searchBufferObjectMap: { [key: string]: Array<JsonNode> } = {};  // Only one item representing

  // current search

  constructor(private dialog: MatDialog, private bottomSheet: MatBottomSheet) {
    this.constructKnownLangsArray();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.listenToSearchTextChange();
  }


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


  collapseAll() {
    // this.tree.treeControl.collapseAll()
    this.treeComponent.collapseAll();
  }

  expandAll() {
    this.treeComponent.expandAll();
  }

  getLanguages4EditingArray(): Array<LanguageProperties> {
    if (this.treeComponent) {
      return this.treeComponent.languages4EditingArray;
    }
    return [];
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
    this.treeComponent.expandNode(aJsonNode);
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
      this.accumulateFoundNodes(this.treeComponent.data, searchBuffer, aCheckFunc);
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
      retIsValid4Search = this.treeComponent.languages4EditingArray.some((langObj: { lang: string }) => {
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
      this.treeComponent.languages4EditingArray.push(aLanguageProperties);

    } else {
      aLanguageProperties.isDisplayed = false;
      _.remove(this.treeComponent.languages4EditingArray, langProperties => langProperties.lang === aLanguageProperties.lang);
    }
  }

  getTranslationMethod() {
    return this.translateEnTo.bind(this);
  }

  getCopyMethod() {
    return this.copyEnTo.bind(this);
  }

  translateEnTo(aLanguageProperties: LanguageProperties) {
    this.convertEn(this.treeComponent.data, aLanguageProperties, NotificationTypesEnum.TRANSLATION_COMPLETE, this.translateMethod);
  }

  copyEnTo(aLanguageProperties: LanguageProperties) {
    const copyMethod = (sourceStrings: Array<string>, lang: string): Promise<Array<string>> => {
      const copiedValues = sourceStrings.map(sourceString => sourceString);
      return new Promise<Array<string>>((resolve, reject) => {
        resolve(copiedValues);
      });
    };
    this.convertEn(this.treeComponent.data, aLanguageProperties, NotificationTypesEnum.ENGLISH_COPY_COMPLETE, copyMethod);
  }

  private convertEn(aData: JsonNode[], aLanguageProperties: LanguageProperties, aMessagesEnum: NotificationTypesEnum,
                    aConversionMethod: (sourceStrings: Array<string>, targetLang: string) => Promise<Array<string>>) {
    const nodesForConversionArray = [];
    this.getNodesForConversion(this.treeComponent.data, aLanguageProperties, nodesForConversionArray);

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
    // TO DO
  }

  upload() {
    const languagesMap = new Map<string, any>();
    const languagesUtilsObjectMap: { [key: string]: any } = {};

    this.treeComponent.languages4EditingArray.forEach((langProperties: LanguageProperties) => {
      const newJson4Lang = {};
      languagesMap.set(langProperties.lang, newJson4Lang);
      languagesUtilsObjectMap[langProperties.lang] = newJson4Lang;
    });

    this.convertDataToJsonObjects(this.treeComponent.data, languagesUtilsObjectMap);

    this.languagesMapOutput.emit(languagesMap);
  }

  private convertDataToJsonObjects(aSourceJsonNodeArray: JsonNode[], aLangObjectMap: { [key: string]: any }) {
    aSourceJsonNodeArray.forEach(jsonNode => {
      const key = jsonNode.key;
      if (jsonNode.hasChildren) {
        this.convertDataToJsonObjects(jsonNode.children(), aLangObjectMap);
      } else {
        this.treeComponent.languages4EditingArray.forEach((langProperties: LanguageProperties) => {
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

  jsonTreeMessageReceived(aNotificationEnum: TreeNotificationTypesEnum) {
    switch (aNotificationEnum) {
      case TreeNotificationTypesEnum.TREE_INITIALIZATION_SUCCESS:
        this.wasLangLoadedOk = true;
        break;
      case TreeNotificationTypesEnum.TREE_INITIALIZATION_FAILED:
        this.wasLangLoadedOk = false;
        break;
    }
  }
}
