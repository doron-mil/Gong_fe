import {Component, ElementRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material';

import {Subscription, timer} from 'rxjs';
import {filter, first, takeUntil} from 'rxjs/operators';
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

  @ViewChild('courseFile', {static: false}) courseFile: ElementRef;
  @ViewChild('gongFile', {static: false}) gongFile: ElementRef;


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


  constructor(ngRedux: NgRedux<any>,
              private storeService: StoreService,
              authService: AuthService,
              private router: Router,
              private dialog: MatDialog,
              private translate: TranslateService) {
    super(null, ngRedux, authService);
  }

  protected hookOnInit() {
    this.getBasicData();
    this.getSupportedLanguages();
    this.initDateFormatOptions();

  }

  protected listenForUpdates() {
    this.ngReduxObj.select<BasicServerData>([StoreDataTypeEnum.DYNAMIC_DATA, 'basicServerData'])
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

    this.ngReduxObj.select<number>([StoreDataTypeEnum.INNER_DATA, 'uploadCoursesFileEnded'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((uploadCount) => {
        if (this.courseFile && this.courseFile.nativeElement) {
          this.courseFile.nativeElement.value = '';
        }
      });

    this.translate.onLangChange.pipe(
      filter(res => !!res && (res.lang.trim() !== '')),
      takeUntil(this.onDestroy$))
      .subscribe((newSetLang) => {
        this.getSupportedLanguages();
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
    this.supportedLanguagesArray = this.translate.getLangs().filter(lang => lang.trim() !== '');
  }

  logout() {
    this.authServiceObj.logout();
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
    this.courseFile.nativeElement.click();
  }

  uploadGongFile() {
    this.gongFile.nativeElement.click();
  }

  onCoursesFileChange() {
    const files = this.courseFile.nativeElement.files;

    if (files && files.length === 1) {
      this.storeService.uploadCourseFile(files[0]);
    }
  }

}
