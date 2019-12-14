import {Component} from '@angular/core';

import {takeUntil} from 'rxjs/operators';

import {NgRedux} from '@angular-redux/store';

import {NotificationTypesEnum} from '../../../json-editor/shared/dataModels/lang.model';
import {BaseComponent} from '../../../shared/baseComponent';
import {DbObjectTypeEnum, IndexedDbService} from '../../../shared/indexed-db.service';
import {StoreDataTypeEnum} from '../../../store/storeDataTypeEnum';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent extends BaseComponent {
  languagesMap: Map<string, any> = new Map<string, any>();

  showJsonEditor: boolean = false;
  isJsonDirty = false;

  staticDataRecentUpdateDate: Date;

  constructor(private ngRedux: NgRedux<any>, private indexedDbService: IndexedDbService) {
    super();
  }

  protected listenForUpdates() {
    this.ngRedux.select<Date>([StoreDataTypeEnum.INNER_DATA, 'staticDataWasUpdated'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((staticDataUpdateDate) => {
        if (staticDataUpdateDate && this.staticDataRecentUpdateDate !== staticDataUpdateDate) {
          this.staticDataRecentUpdateDate = staticDataUpdateDate;
          this.getLanguagesMap();
        }
      });
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
  }

  languagesMapUpdateReceived(aReceivedLangMap: Map<string, any>) {
    console.log('languagesMapUpdateReceived ', aReceivedLangMap);
  }
}
