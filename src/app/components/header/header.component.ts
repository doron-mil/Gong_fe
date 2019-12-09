import {Component, ElementRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material';

import {Subscription, timer} from 'rxjs';
import {first, takeUntil} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {NgRedux} from '@angular-redux/store';

import moment from 'moment';
import {BaseComponent} from '../../shared/baseComponent';
import {DateFormat} from '../../model/dateFormat';
import {BasicServerData} from '../../model/basicServerData';
import {StoreDataTypeEnum} from '../../store/storeDataTypeEnum';
import {StoreService} from '../../services/store.service';
import {AuthService} from '../../services/auth.service';
import {SelectCoursesDialogComponent} from '../../dialogs/select-courses-dialog/select-courses-dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends BaseComponent {

  @ViewChild('courseFile', {static: false}) file: ElementRef;

  isLoggedIn = false;
  currentRole: string;

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
              private dialog: MatDialog,
              private translate: TranslateService) {
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

    this.ngRedux.select<number>([StoreDataTypeEnum.INNER_DATA, 'uploadCoursesFileEnded'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((uploadCount) => {
        if (this.file && this.file.nativeElement) {
          this.file.nativeElement.value = '';
        }
      });

    this.ngRedux.select<boolean>([StoreDataTypeEnum.INNER_DATA, 'isLoggedIn'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((pIsLoggedIn) => {
        this.isLoggedIn = pIsLoggedIn;
        if (!this.isLoggedIn) {
          this.isLoggedIn = this.authService.loggedIn;
        }
        if (pIsLoggedIn) {
          this.currentRole = this.authService.getRole();
        } else {
          this.currentRole = '';
        }
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
    if (this.dateFormatOptions) {
      this.dateFormatOptions.forEach(dateFormat => dateFormat.changeDelimited(this.currentDateFormat.delimiter));
    }
  }

  downloadFile() {
    const coursesNames = this.storeService.getCoursesNames(this.currentRole);

    const dialogRef = this.dialog.open(SelectCoursesDialogComponent, {
      height: '70vh',
      width: '70vw',
      position: {top: '15vh'},
      data: {availableCourses: coursesNames, forAction: 'download'}
    });

    dialogRef.afterClosed()
      .pipe(first())
      .subscribe((selectedCourses: string[]) => {
        if (selectedCourses) {
          this.storeService.downloadCourses(selectedCourses);
        }
      });
  }

  uploadCoursesFile() {
    this.file.nativeElement.click();
  }

  onCoursesFileChange() {
    const files = this.file.nativeElement.files;

    if (files && files.length === 1) {
      this.storeService.uploadCourseFile(files[0]);
    }
  }

  isAdminRole() {
    return ['admin', 'dev'].includes(this.currentRole);
  }
}
