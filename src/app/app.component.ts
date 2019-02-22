import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgRedux} from '@angular-redux/store';
import {Router} from '@angular/router';
import {StoreService} from './services/store.service';
import {StoreDataTypeEnum} from './store/storeDataTypeEnum';
import {BasicServerData} from './model/basicServerData';
import {Subscription, timer} from 'rxjs';
import * as moment from 'moment';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  public now: moment.Moment;
  nextGongTime: moment.Moment;
  isManual: boolean;

  supportedLanguagesArray: string[];
  currentLanguage: string = 'en';

  storeSubscription: Subscription;
  timerSubscription: Subscription;
  nextGongSubscription: Subscription;

  constructor(private ngRedux: NgRedux<any>,
              private storeService: StoreService,
              private authService: AuthService,
              private router: Router,
              private translate: TranslateService,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer) {
    this.translate.setDefaultLang(this.currentLanguage);
    this.translate.use(this.currentLanguage);

    this.addSvgIcons();
  }

  private addSvgIcons() {
    // this.matIconRegistry.addSvgIcon(
    //   'options',
    //   this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/baseline-apps-24px.svg')
    // );
    // this.matIconRegistry.addSvgIcon(
    //   'language',
    //   this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/baseline-language-24px.svg')
    // );
    // this.matIconRegistry.addSvgIcon(
    //   'power_off',
    //   this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/baseline-power_off-24px.svg')
    // );
    this.matIconRegistry.addSvgIcon(
      'lang_he',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/lang/he.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'lang_en',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/lang/en.svg')
    );
  }

  ngOnInit(): void {
    this.listenToStore();
    this.getSupportedLanguages();
    this.getBasicData();
  }

  private listenToStore() {
    this.storeSubscription = this.ngRedux.select<BasicServerData>([StoreDataTypeEnum.DYNAMIC_DATA, 'basicServerData'])
      .subscribe((basicServerData: BasicServerData) => {
        if (basicServerData) {
          this.releaseSubscriptions();
          this.now = moment(basicServerData.currentServerTime);
          const timeToNextMin = this.now.clone().endOf('minute').diff(this.now) + 1;
          this.timerSubscription = timer(timeToNextMin, 60 * 1000).subscribe((tik) => {
            if (tik === 0) {
              this.now = this.now.clone().add(timeToNextMin, 'ms');
            } else {
              this.now = this.now.clone().add(1, 'm');
            }
          });
          this.nextGongTime = moment(basicServerData.nextScheduledJobTime);
          this.isManual = basicServerData.isManual;
          const timeToNextScheduledJob = this.nextGongTime.clone().startOf('minute').add(1, 'm');
          this.nextGongSubscription = timer(timeToNextScheduledJob.toDate()).subscribe(() => {
            this.getBasicData();
          });
        }
      });
  }

  getBasicData(): void {
    this.storeService.getBasicData();
  }

  private getSupportedLanguages() {
    this.supportedLanguagesArray = this.translate.getLangs();
  }

  releaseSubscriptions(aIsAlsoStore: boolean = false): void {
    if (this.storeSubscription && aIsAlsoStore) {
      this.storeSubscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.nextGongSubscription) {
      this.nextGongSubscription.unsubscribe();
    }
  }

  setLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }

  ngOnDestroy(): void {
    this.releaseSubscriptions(true);
  }

}
