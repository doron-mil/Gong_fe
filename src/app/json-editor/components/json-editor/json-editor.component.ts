import {Component, OnInit} from '@angular/core';
import {MatDialog, MatTreeNestedDataSource} from '@angular/material';
import {NestedTreeControl} from '@angular/cdk/tree';
import * as _ from 'lodash';

import staticJsonImport from '../../../../assets/i18n/en.json';
import staticJsonImport2 from '../../../../assets/i18n/he.json';
import {lang} from 'moment';
import {NameEditDialogComponent} from '../../dialogs/name-edit-dialog/name-edit-dialog.component';

// https://www.google.com/search?q=json+representation+in+typescript&oq=json+representation+in+ty&aqs=chrome.1.69i57j33l2.21951j0j7&sourceid=chrome&ie=UTF-8

// https://github.com/ngx-translate/core

// https://www.google.com/search?q=typescript+json+iterate&oq=typescript+json+it&aqs=chrome.1.69i57j0l3j69i60l2.10887j0j7&sourceid=chrome&ie=UTF-8

// https://www.google.com/search?q=typescript+multiple+object+type&oq=typescript+multiple+ob&aqs=chrome.1.69i57j0l5.17175j0j7&sourceid=chrome&ie=UTF-8
// typescriptlang.org/docs/handbook/advanced-types.html
//

const MAX_NO_LANGUAGES_4_EDITING = 2;

enum SearchByEnum {
  PROBLEM,
  TEXT,
}

enum ProblemType {
  NONE,
  MISS_MATCH_PROBLEM,
  NOT_EXIST_ON_EN,
  NOT_EXIST_ON_OTHER_LANG,
}

class JsonNode {
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
export class JsonEditorComponent implements OnInit {

  treeControl = new NestedTreeControl<JsonNode>(node => node.children());
  dataSource = new MatTreeNestedDataSource<JsonNode>();
  data: JsonNode[];

  maxNoLanguages4Editing = MAX_NO_LANGUAGES_4_EDITING;
  languages4EditingArray: { lang: string, isRtl?: boolean }[];

  problemType = ProblemType;
  problemsSearchCounter: number;

  searchByOptions = SearchByEnum;
  searchBy: SearchByEnum = SearchByEnum.PROBLEM;
  searchText: string = '';

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
    // this.languages4EditingArray = [{lang: 'en'}, {lang: 'he', isRtl: true}, {lang: 'fr'}];
    this.languages4EditingArray = [{lang: 'en'}, {lang: 'he', isRtl: true}];

    this.data = this.convertJsonIntoJsonNode(staticJsonImport, '', 'en');
    this.loadAnotherLanguage(this.data, staticJsonImport2, 'he');

    this.search4AdditionalProblems(this.data);

    this.dataSource.data = this.data;
    this.treeControl.dataNodes = this.data;
  }

  hasChild = (_: number, node: JsonNode) => !!node.hasChildren;

  private convertJsonIntoJsonNode(aJsonObj: { [key: string]: string | any },
                                  aPrevPath: string,
                                  aLang: string,
                                  aParent: JsonNode = null): JsonNode[] {
    const retJsonNodeArray: JsonNode[] = [];
    let maxKeyLen = 0;
    Object.entries(aJsonObj).forEach((objectItem: Array<any>) => {

      const key = objectItem[0] as string;
      const value = objectItem[1];

      const newJsonNode = this.createJsonNodeFromKeyValue(key, value, aPrevPath, aLang, aParent);
      maxKeyLen = !newJsonNode.hasChildren ? Math.max(maxKeyLen, key.length) : maxKeyLen;

      retJsonNodeArray.push(newJsonNode);
    });
    retJsonNodeArray.forEach(jsonNode => jsonNode.maxKeyLength4Level = maxKeyLen);
    return retJsonNodeArray;
  }


  private createJsonNodeFromKeyValue(aKey: string, aValue: string | any, aPrevPath, aLang: string, aParent: JsonNode = null): JsonNode {
    const newJsonNode = new JsonNode();

    newJsonNode.key = aKey;
    newJsonNode.fullPath = `${aPrevPath}${aPrevPath ? '.' : ''}${aKey}`;
    const hasChildren = !_.isString(aValue);
    newJsonNode.hasChildren = hasChildren;
    newJsonNode.parent = aParent;
    newJsonNode.value = (!hasChildren) ? {[aLang]: aValue} : this.convertJsonIntoJsonNode(aValue, newJsonNode.fullPath, aLang, newJsonNode);

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
          console.log('Error A', foundJsonNode.fullPath);
        }
      } else {
        const currentFirstItem = aBaseDataModelArray[0];
        const currentFirstItemPath = currentFirstItem.fullPath;
        const currentFirstItemParent = currentFirstItem.parent;
        const lastPointIndex = currentFirstItemPath.lastIndexOf('.');
        const prevPath = currentFirstItemPath.substring(0, lastPointIndex);
        const newJsonNode = this.createJsonNodeFromKeyValue(key, value, prevPath, aLang, currentFirstItemParent);
        newJsonNode.problemType = ProblemType.NOT_EXIST_ON_EN;
        aBaseDataModelArray.push(newJsonNode);
        console.log('Error B', key, prevPath, newJsonNode);
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
      }
    });

    // console.log('1111', aNode);
  }

  editNodePath(aNode: JsonNode) {
    console.log('1111', aNode);
  }

  deletNode(aNode: JsonNode) {
    console.log('1111', aNode);

  }

  addChildNode(aNode: JsonNode, aIsContainer: boolean = true) {
    this.treeControl.expand(aNode);
  }

  onSearchBySelectedChange() {
    this.searchText = '';
    console.log('11111', this.searchBy);
  }

  searchBy2(aIsNext: boolean = true) {
    if (this.searchBy === SearchByEnum.PROBLEM) {
      this.searchProblem(aIsNext);
    } else {
      this.search4Text(aIsNext);
    }
  }

  searchProblem(aIsNext: boolean = true) {
    this.expandAll();
    setTimeout(() => {
      const elArray = document.getElementsByClassName('problem-detected');
      const problemsCount = elArray ? elArray.length : 0;
      if (problemsCount) {
        const step = aIsNext ? 1 : -1;
        this.problemsSearchCounter = _.isNil(this.problemsSearchCounter) ? 0 : this.problemsSearchCounter + step;
        const isInRange = _.inRange(this.problemsSearchCounter, 0, problemsCount);
        this.problemsSearchCounter = isInRange ? this.problemsSearchCounter :
          (this.problemsSearchCounter < 0 ? problemsCount - 1 : 0);
        // console.log('1111', problemsCount , this.problemsSearchCounter);
        elArray[this.problemsSearchCounter].scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
      }
    }, 0);
  }

  searchTextChanged(aSearchText: string) {
    this.searchText = aSearchText;
    console.log('2222', aSearchText, this.searchText);
    this.search4Text();

  }

  search4Text(aIsNext: boolean = true) {
    const foundNode = this.getNodeForText(this.data);
    if (foundNode) {
      this.expandNode(foundNode);
      console.log('33333', foundNode);
    }
  }

  private expandNode(aJsonNode: JsonNode) {
    if (aJsonNode.parent) {
      this.expandNode(aJsonNode.parent);
    }
    this.treeControl.expand(aJsonNode);
  }

  private getNodeForText(aData: JsonNode[]) {
    let foundNode: JsonNode = null;
    _.forEach(aData, (jsonNodeObject: JsonNode) => {
      if (jsonNodeObject.key.indexOf(this.searchText) >= 0) {
        foundNode = jsonNodeObject;
      } else if (!jsonNodeObject.hasChildren) {
        _.forEach(this.languages4EditingArray, (langObj: { lang: string }) => {
          const value = jsonNodeObject.value[langObj.lang] as string;
          if (value && value.indexOf(this.searchText) >= 0) {
            foundNode = jsonNodeObject;
            return false;
          }
        });
      } else {
        foundNode = this.getNodeForText(jsonNodeObject.children());
      }

      if (foundNode) {
        return false;
      }
    });
    return foundNode;
  }
}
