import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatBottomSheet, MatDialog, MatTree, MatTreeNestedDataSource} from '@angular/material';

import * as _ from 'lodash';

import {JsonNode, ProblemType, TreeNotificationTypesEnum} from '../../shared/dataModels/tree.model';

import {LanguageProperties} from '../../shared/dataModels/lang.model';
import {NameEditDialogComponent} from '../../dialogs/name-edit-dialog/name-edit-dialog.component';
import {MessagesComponent} from '../../dialogs/messages/messages.component';
import {BasicNode, NewNodeDialogComponent} from '../../dialogs/new-node-dialog/new-node-dialog.component';


@Component({
  selector: 'app-json-tree',
  templateUrl: './json-tree.component.html',
  styleUrls: ['./json-tree.component.scss']
})
export class JsonTreeComponent implements OnInit {

  @Input() languagesMap: Map<string, any>;
  @Input() foundObjectID: string;
  @Input() knownLangsArray: Array<LanguageProperties>;

  @Input() allowNodesMenu: boolean = true;
  @Input() readonlyLanguages: string[] = [];

  @Output() outputMessages = new EventEmitter<TreeNotificationTypesEnum>();

  @ViewChild('tree', {static: true}) tree: MatTree<JsonNode>;

  problemType = ProblemType;

  treeControl = new NestedTreeControl<JsonNode>(node => node.children());
  dataSource = new MatTreeNestedDataSource<JsonNode>();
  data: JsonNode[];


  languages4EditingArray: Array<LanguageProperties>;

  constructor(private dialog: MatDialog, private bottomSheet: MatBottomSheet) {
  }

  ngOnInit() {
    const constructionOK = this.constructLanguagesDataStructure();
    this.outputMessages.emit(constructionOK ? TreeNotificationTypesEnum.TREE_INITIALIZATION_SUCCESS
      : TreeNotificationTypesEnum.TREE_INITIALIZATION_FAILED);

    this.dataSource.data = this.data;
    this.treeControl.dataNodes = this.data;
  }

  hasChild = (aNumber: number, node: JsonNode) => !!node.hasChildren;

  collapseAll() {
    this.treeControl.collapseAll();
  }

  expandAll() {
    this.treeControl.expandAll();
  }

  expandNode(aJsonNode: JsonNode) {
    if (aJsonNode.parent) {
      this.expandNode(aJsonNode.parent);
    }
    this.treeControl.expand(aJsonNode);
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

  getMaxLabelWidth(aNode: JsonNode): string {
    const maxLen = aNode.maxKeyLength4Level;
    let retWidth;
    if (maxLen < 10) {
      retWidth = '12vw';
    } else if (maxLen < 20) {
      retWidth = '18vw';
    } else if (maxLen < 25) {
      retWidth = '22vw';
    } else {
      retWidth = '27vw';
    }
    return retWidth;
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
    // TO DO
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
        this.recalculateMaxKeyLength4Level(aNode);

        this.treeControl.expand(aNode);
        this.reRenderTree();
      }
    });
  }

  private recalculateMaxKeyLength4Level(aNode: JsonNode) {
    let maxKeyLen = 0;
    aNode.children().forEach(jsonNode => maxKeyLen = Math.max(jsonNode.key.length, maxKeyLen));
    aNode.children().forEach(jsonNode => jsonNode.maxKeyLength4Level = maxKeyLen);
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

}
