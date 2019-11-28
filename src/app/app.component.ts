import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import {TranslateService} from '@ngx-translate/core';

import {BaseComponent} from './shared/baseComponent';
import {DbObjectTypeEnum, IndexedDbService} from './shared/indexed-db.service';
import {BasicServerData} from './model/basicServerData';
import {StoreDataTypeEnum} from './store/storeDataTypeEnum';
import {filter, takeUntil} from 'rxjs/operators';
import {NgRedux} from '@angular-redux/store';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends BaseComponent {

  currentLanguage: string = 'en';

  constructor(
    private ngRedux: NgRedux<any>,
    private translate: TranslateService,
    private indexedDbService: IndexedDbService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) {

    super();
    this.translate.setDefaultLang('en');
    this.addSvgIcons();
  }

  protected listenForUpdates() {
    this.translate.onLangChange.pipe(
      filter(res => !!res && ( res.lang.trim() !== '')),
      takeUntil(this.onDestroy$))
      .subscribe((newSetLang) => {
        this.currentLanguage = newSetLang.lang;
      });

    this.ngRedux.select<Date>([StoreDataTypeEnum.INNER_DATA, 'staticDataWasUpdated'])
      .pipe(
        takeUntil(this.onDestroy$))
      .subscribe((updateDate) => {
        this.indexedDbService.getStoredDataAllKeys(DbObjectTypeEnum.LANGUAGES).then((allKeys) => {
          const currentUsedLangs = [...this.translate.getLangs()];
          currentUsedLangs.filter(lang => !allKeys.includes(lang)).forEach(lang => this.translate.resetLang(lang));
          this.translate.getLangs().forEach(lang => this.translate.reloadLang(lang));

          const lang2AddArray = allKeys.filter(lang => !currentUsedLangs.includes(lang));
          if (lang2AddArray.length > 0) {
            this.translate.addLangs(lang2AddArray);
          }

          // Because of a bug in ngx-translate (in order for the onLangChange to trigger
          this.translate.use('').subscribe(() => {
            this.translate.use(this.currentLanguage);
            this.translate.resetLang('');
          });
        });
      });
  }

  private addSvgIcons() {
    this.matIconRegistry.addSvgIcon(
      'lang_he',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/lang/he.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'lang_en',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/lang/en.svg')
    );
  }


}
