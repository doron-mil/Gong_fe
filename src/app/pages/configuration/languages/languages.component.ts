import {Component} from '@angular/core';

import {takeUntil} from 'rxjs/operators';

import {NgRedux} from '@angular-redux/store';

import {NotificationTypesEnum} from '../../../json-editor/shared/dataModels/lang.model';
import {BaseLangComponent} from '../base-lang.component';
import {DbObjectTypeEnum, IndexedDbService} from '../../../shared/indexed-db.service';
import {StoreDataTypeEnum} from '../../../store/storeDataTypeEnum';
import {AuthService} from '../../../services/auth.service';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent extends BaseLangComponent {
  showJsonEditor: boolean = false;
  isJsonDirty = false;

  staticDataRecentUpdateDate: Date;

  constructor(ngRedux: NgRedux<any>,
              indexedDbService: IndexedDbService,
              authService: AuthService) {
    super(null, ngRedux, authService, indexedDbService);
  }

  protected listenForUpdates() {
    this.ngReduxObj.select<Date>([StoreDataTypeEnum.INNER_DATA, 'staticDataWasUpdated'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((staticDataUpdateDate) => {
        if (staticDataUpdateDate && this.staticDataRecentUpdateDate !== staticDataUpdateDate) {
          this.staticDataRecentUpdateDate = staticDataUpdateDate;
          super.getLanguagesMap();
        }
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
    // this.globalLanguagesMap = aReceivedLangMap;

    super.saveGlobalLanguagesMap(aReceivedLangMap);
  }
}
