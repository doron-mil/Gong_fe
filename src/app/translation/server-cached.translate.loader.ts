import {TranslateLoader} from '@ngx-translate/core';
import {from, Observable} from 'rxjs';

import {DbObjectTypeEnum, IndexedDbService} from '../shared/indexed-db.service';

export function ServerCachedLoaderFactory(aIndexedDbService: IndexedDbService) {
  return new ServerCachedTransLoader(aIndexedDbService);
}

export class ServerCachedTransLoader implements TranslateLoader {

  constructor(private indexedDbService: IndexedDbService) {
  }

  public getTranslation(lang: string, prefix: string = ''): Observable<any> {
    const retLanguage = this.indexedDbService.getStoredDataRecord4Key(DbObjectTypeEnum.LANGUAGES, lang);
    return from(retLanguage);
  }
}
