import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../../shared/baseComponent';
import moment from 'moment';
import {DateFormat} from '../../model/dateFormat';
import {Subscription, timer} from 'rxjs';
import {BasicServerData} from '../../model/basicServerData';
import {StoreDataTypeEnum} from '../../store/storeDataTypeEnum';
import {NgRedux} from '@angular-redux/store';
import {StoreService} from '../../services/store.service';
import {AuthService} from '../../services/auth.service';
import {takeUntil} from 'rxjs/operators';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends BaseComponent {

  supportedLanguagesArray: string[];
  currentLanguage: string = 'en';

  dateFormatOptions: DateFormat[];
  currentDateFormat: DateFormat;
  delimitersOptions: string[];

  public now: moment.Moment;
  nextGongTime: moment.Moment;
  isManual: boolean;

  timerSubscription: Subscription;
  nextGongSubscription: Subscription;

  constructor(private ngRedux: NgRedux<any>,
              private storeService: StoreService,
              private authService: AuthService,
              private router: Router,
              private translate: TranslateService,) {
    super();

    this.translate.addLangs(['en', 'he']);
    this.translate.setDefaultLang(this.currentLanguage);
    this.translate.use(this.currentLanguage);

  }

  protected hookOnInit() {
    this.getBasicData();
    this.getSupportedLanguages();
    this.initDateFormatOptions();

  }

  protected listenForUpdates() {
    this.ngRedux.select<BasicServerData>([StoreDataTypeEnum.DYNAMIC_DATA, 'basicServerData'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((basicServerData: BasicServerData) => {
        if (basicServerData) {
          this.now = moment(basicServerData.currentServerTime);
          const timeToNextMin = this.now.clone().endOf('minute').diff(this.now) + 1;
          this.timerSubscription = timer(timeToNextMin, 60 * 1000).subscribe((tik) => {
            if (tik === 0) {
              this.now = this.now.clone().add(timeToNextMin, 'ms');
            } else {
              this.now = this.now.clone().add(1, 'm');
            }
          });
          this.isManual = basicServerData.isManual;
          const nextGongTime = moment(basicServerData.nextScheduledJobTime);
          if (!nextGongTime.isSame(this.nextGongTime)) {
            this.nextGongTime = nextGongTime;
            const timeToNextScheduledJob = this.nextGongTime.clone().startOf('minute').add(1, 'm');
            this.nextGongSubscription = timer(timeToNextScheduledJob.toDate()).subscribe(() => {
              this.getBasicData();
            });
          }
        }
      });

    this.storeService.getDateFormat()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((dateFormat: DateFormat) => {
        this.currentDateFormat = dateFormat;
        this.delimiterChanged();
      });
  }

  initDateFormatOptions(): void {

    this.delimitersOptions = [];
    this.delimitersOptions.push('-');
    this.delimitersOptions.push('/');

    this.dateFormatOptions = [];
    this.dateFormatOptions.push(new DateFormat('DD/MM/YYYY', '/'));
    this.dateFormatOptions.push(new DateFormat('MM/DD/YYYY', '/'));
    this.dateFormatOptions.push(new DateFormat('YYYY/MM/DD', '/'));
    this.dateFormatOptions.push(new DateFormat('YYYY/DD/MM', '/'));

  }


  private getSupportedLanguages() {
    this.supportedLanguagesArray = this.translate.getLangs();
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }

  getBasicData(): void {
    this.storeService.getBasicData();
  }

  setLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
  }

  setDateFormat(aDateFormat: DateFormat) {
    this.currentDateFormat = aDateFormat;
    this.storeService.setDateFormat(this.currentDateFormat);
  }

  setDelimiter(aDelimiter: string) {
    this.currentDateFormat.delimiter = aDelimiter;
    this.storeService.setDateFormat(this.currentDateFormat);
  }

  delimiterChanged() {
    this.dateFormatOptions.forEach(dateFormat => dateFormat.changeDelimited(this.currentDateFormat.delimiter));
  }

}
