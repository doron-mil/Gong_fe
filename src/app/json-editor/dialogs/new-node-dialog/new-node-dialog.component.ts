import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LanguageProperties} from '../../shared/dataModels/lang.model';

const ENGLISH_CODE = 'en';

export class BasicNode {
  key: string;
  value: { [key: string]: string };
}

@Component({
  selector: 'app-new-node-dialog',
  templateUrl: './new-node-dialog.component.html',
  styleUrls: ['./new-node-dialog.component.scss']
})
export class NewNodeDialogComponent implements OnInit {

  key: string;
  values: { [key: string]: string } = {};

  handledLanguages: Array<LanguageProperties>;
  siblingsKeyNamesArray: Array<string>;

  keyError: string;
  enError: string;

  constructor(public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: { siblingsKeyNamesArray: Array<string>, handledLang: Array<LanguageProperties> }) {
    this.handledLanguages = this.data.handledLang;
    this.siblingsKeyNamesArray = this.data.siblingsKeyNamesArray;
    if (this.handledLanguages) {
      this.handledLanguages.forEach(langProperties => this.values[langProperties.lang] = '');
    }
  }

  ngOnInit() {
  }

  submit() {
    const retBasicNode = new BasicNode();
    retBasicNode.key = this.key;
    if (this.handledLanguages) {
      retBasicNode.value = this.values;
    }
    this.dialogRef.close(retBasicNode);
  }

  closeDialog() {
    this.dialogRef.close(null);
  }

  // TO DO - move validation to Angular validations
  isReadyForSubmit(): boolean {
    this.keyError = null;
    this.enError = null;

    const keyTrimmed = this.key ? this.key.trim() : '';
    let retValue = keyTrimmed && keyTrimmed.indexOf('.') < 0 && !this.siblingsKeyNamesArray.includes(keyTrimmed);

    if (retValue && this.handledLanguages) {
      let englishTrans = this.values[ENGLISH_CODE];
      englishTrans = englishTrans ? englishTrans.trim() : '';
      retValue = englishTrans && true;
      if (!retValue) {
        this.enError = 'English translation must be filled';
      }
    } else if (!retValue) {
      if (!keyTrimmed) {
        this.keyError = 'Key must have a value';
      } else if (keyTrimmed.indexOf('.') >= 0) {
        this.keyError = 'Key must not have a dot in it';
      } else {
        this.keyError = 'Key value already in use';
      }
    }
    return retValue;
  }
}
