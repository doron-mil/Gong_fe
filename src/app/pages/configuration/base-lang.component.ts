import {NgRedux} from '@angular-redux/store';
import {TranslateService} from '@ngx-translate/core';

import {BaseComponent} from '../../shared/baseComponent';
import {AuthService} from '../../services/auth.service';
import {DbObjectTypeEnum, IndexedDbService} from '../../shared/indexed-db.service';
import {ActionGenerator} from '../../store/actions/action';


export class BaseLangComponent extends BaseComponent {
  globalLanguagesMap: Map<string, any>;
  private storeUpdatedWithLang: boolean = false;

  constructor(translateService: TranslateService = null,
              ngRedux: NgRedux<any> = null,
              authServiceObj: AuthService = null,
              protected indexedDbService: IndexedDbService = null) {
    super(translateService, ngRedux, authServiceObj);
  }

  protected getLanguagesMap(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.indexedDbService) {
        this.indexedDbService.getAllStoredDataRecordsAndKeysMap(DbObjectTypeEnum.LANGUAGES).then((languages) => {
          if (!this.storeUpdatedWithLang) {
            this.globalLanguagesMap = languages;
          } else {
            this.storeUpdatedWithLang = false;
          }
          resolve();
        });
      } else {
        reject();
      }
    });
  }

  protected saveGlobalLanguagesMap(aReceivedLangMap: Map<string, any>) {
    const langsObjArray = [];
    Array.from(aReceivedLangMap.entries()).forEach((entry) => {
      langsObjArray.push({language: entry[0], translation: entry[1]});
    });
    if (this.ngReduxObj) {
      this.storeUpdatedWithLang = true;
      this.ngReduxObj.dispatch(ActionGenerator.updateLanguages(langsObjArray));
    }
  }


}
