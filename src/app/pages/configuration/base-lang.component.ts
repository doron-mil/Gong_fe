import {NgRedux} from '@angular-redux/store';
import {TranslateService} from '@ngx-translate/core';

import {BaseComponent} from '../../shared/baseComponent';
import {AuthService} from '../../services/auth.service';
import {DbObjectTypeEnum, IndexedDbService} from '../../shared/indexed-db.service';
import {ActionGenerator} from '../../store/actions/action';


export class BaseLangComponent extends BaseComponent {
  protected globalLanguagesMap: Map<string, any>;

  constructor(translateService: TranslateService = null,
              ngRedux: NgRedux<any> = null,
              authServiceObj: AuthService = null,
              protected indexedDbService: IndexedDbService = null) {
    super(translateService, ngRedux, authServiceObj);
  }

  protected getLanguagesMap(): Promise<void> {
    return new Promise(resolve => {
      this.indexedDbService.getAllStoredDataRecordsAndKeysMap(DbObjectTypeEnum.LANGUAGES).then((languages) => {
        this.globalLanguagesMap = languages;
        resolve();
      });
    });
  }

  protected saveGlobalLanguagesMap() {
    const langsObjArray = [];
    Array.from(this.globalLanguagesMap.entries()).forEach((entry) => {
      langsObjArray.push({language: entry[0], translation: entry[1]});
    });
    this.ngReduxObj.dispatch(ActionGenerator.updateLanguages(langsObjArray));
  }


}
