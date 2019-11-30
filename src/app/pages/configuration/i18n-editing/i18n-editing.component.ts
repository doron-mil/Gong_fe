import {Component} from '@angular/core';
import {MatRadioChange} from '@angular/material';

import * as _ from 'lodash';

import {NotificationTypesEnum} from '../../../json-editor/shared/dataModels/lang.model';
import {BaseComponent} from '../../../shared/baseComponent';
import {DbObjectTypeEnum, IndexedDbService} from '../../../shared/indexed-db.service';
import {EnumUtils} from '../../../utils/enumUtils';

enum TopicsEnum {
  AREAS = 'areas',
  COURSES = 'courses',
  GONGS = 'gongType',
}

@Component({
  selector: 'app-areas-i18n',
  templateUrl: './i18n-editing.component.html',
  styleUrls: ['./i18n-editing.component.scss']
})
export class I18nEditingComponent extends BaseComponent {
  globalLanguagesMap: Map<string, any>;
  languagesMap: Map<string, any> = new Map<string, any>();

  topics: Array<TopicsEnum> = [];
  selectedTopic: TopicsEnum;

  constructor(private indexedDbService: IndexedDbService) {
    super();
  }

  protected hookOnInit() {
    this.topics.push(...EnumUtils.getEnumValues(TopicsEnum));
    this.selectedTopic = this.topics[0];

    this.getLanguagesMap();
  }

  private getLanguagesMap() {
    this.indexedDbService.getAllStoredDataRecordsAndKeysMap(DbObjectTypeEnum.LANGUAGES).then((languages) => {
      this.globalLanguagesMap = languages;
      this.reloadJsonEditorForTopic();
    });
  }

  languagesMapUpdateReceived(aReceivedLangMap: Map<string, any>) {
    console.log('languagesMapUpdateReceived ', aReceivedLangMap);
  }

  jsonEditorMessageReceived(aMessagesEnum: NotificationTypesEnum) {
    console.log(`jsonEditorMessageReceived was activated with value ${aMessagesEnum}`);
  }

  topicHasChanged(aEvent: MatRadioChange) {
    this.reloadJsonEditorForTopic(aEvent.value as TopicsEnum);
  }

  private reloadJsonEditorForTopic(aSelectedTopic: TopicsEnum = this.selectedTopic) {
    this.languagesMap = new Map<string, any>();

    const keys = Array.from(this.globalLanguagesMap.keys());
    keys.forEach(key => {
      const translation = this.globalLanguagesMap.get(key);
      const translationSubPart = _.get(translation, ['general', 'typesValues', aSelectedTopic]);
      this.languagesMap.set(key, translationSubPart);
    });
  }

}
