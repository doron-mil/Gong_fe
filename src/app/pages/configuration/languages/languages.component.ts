import {Component, OnInit} from '@angular/core';
import {NotificationTypesEnum} from '../../../json-editor/shared/dataModels/lang.model';
import {BaseComponent} from '../../../shared/baseComponent';
import {EnumUtils} from '../../../utils/enumUtils';
import {DbObjectTypeEnum, IndexedDbService} from '../../../shared/indexed-db.service';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent extends BaseComponent {
  languagesMap: Map<string, any> = new Map<string, any>();

  showJsonEditor: boolean = false;
  isJsonDirty = false;

  constructor(private indexedDbService: IndexedDbService) {
    super();
  }

  protected hookOnInit() {
    this.getLanguagesMap();
  }

  private getLanguagesMap() {
    this.indexedDbService.getAllStoredDataRecordsAndKeysMap(DbObjectTypeEnum.LANGUAGES).then((languages) => {
      this.languagesMap = languages;
    });
  }


  jsonEditorMessageReceived(aMessagesEnum: NotificationTypesEnum) {
    switch (aMessagesEnum) {
      case NotificationTypesEnum.TREE_INITIALIZATION_SUCCESS:
        if (!this.showJsonEditor) {
          setTimeout(() => this.showJsonEditor = true);
        }
        break;
      case NotificationTypesEnum.TREE_IS_DIRTY:
        this.isJsonDirty = true;
        break;
      case NotificationTypesEnum.TREE_IS_CLEAN:
        this.isJsonDirty = false;
        break;
    }

    console.log('1111 jsonEditorMessageReceived', aMessagesEnum);
  }

  languagesMapUpdateReceived(aReceivedLangMap: Map<string, any>) {
    console.log('languagesMapUpdateReceived ', aReceivedLangMap);
  }

  saveJson() {
    console.log('22222');
  }


}
