import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {NgRedux} from '@angular-redux/store';
import {Area} from '../model/area';
import {TranslateService} from '@ngx-translate/core';
import {StoreDataTypeEnum} from '../store/storeDataTypeEnum';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {GongType} from '../model/gongType';
import {Course} from '../model/course';
import {
  addManualGong,
  getBasicData,
  readToStoreData,
  removeScheduleCourse,
  scheduleCourse,
  toggleScheduledGong
} from '../store/actions/action';
import {ScheduledGong} from '../model/ScheduledGong';
import {CourseSchedule} from '../model/courseSchedule';
import {ScheduledCourseGong} from '../model/ScheduledCourseGong';

@Injectable({
  providedIn: 'root'
})
export class StoreService implements OnInit, OnDestroy {

  private areasMapObservable: BehaviorSubject<Area[]> = new BehaviorSubject<Area[]>([]);
  private gongTypesMapObservable: BehaviorSubject<GongType[]> = new BehaviorSubject<GongType[]>([]);
  private coursesMapObservableObsolete: BehaviorSubject<{ [key: string]: Course }> =
    new BehaviorSubject<{ [key: string]: Course }>({});
  private coursesMapObservable: BehaviorSubject<Map<string, Course>> = new BehaviorSubject<Map<string, Course>>(null);

  areasMap: Area[] = [];
  gongTypesMap: GongType[] = [];
  coursesMapObsolete: { [key: string]: Course } = {};
  coursesMap: Map<string, Course>;

  subscriptionsArray: Subscription[] = [];

  courseScheduleArray: CourseSchedule[];
  isCourseScheduleArrayEnhanced: boolean;

  constructor(private ngRedux: NgRedux<any>,
              private translateService: TranslateService) {
    this.populateAreasMap();
    this.populateGongTypesMap();
    this.populateGongTypeCoursesMap();
    this.populateScheduledCoursesArray();
  }

  ngOnInit(): void {
  }

  private populateAreasMap() {
    const areaSubscription =
      this.ngRedux.select<Area[]>([StoreDataTypeEnum.STATIC_DATA, 'areas']).subscribe((areaArry: Area[]) => {
        if (areaArry && areaArry.length > 0) {
          this.areasMap = [];
          areaArry.forEach((area: Area) => {
            this.translateService.get('general.typesValues.areas.values.' + area.name).subscribe(areaTrans => {
              area.translation = areaTrans;
            });
            this.areasMap[area.id] = area;
          });
        }
        this.areasMapObservable.next(this.areasMap);
      });

    this.subscriptionsArray.push(areaSubscription);
  }

  private populateGongTypesMap() {
    const gongTypeSubscription =
      this.ngRedux.select<GongType[]>([StoreDataTypeEnum.STATIC_DATA, 'gongTypes'])
        .subscribe((gongTypes: GongType[]) => {
          if (gongTypes && gongTypes.length > 0) {
            this.gongTypesMap = new Array();
            gongTypes.forEach((gongType: GongType) => {
              this.gongTypesMap[gongType.id] = gongType;
            });
          }
          this.gongTypesMapObservable.next(this.gongTypesMap);
        });

    this.subscriptionsArray.push(gongTypeSubscription);
  }

  private populateGongTypeCoursesMap() {
    const coursesSubscription =
      this.ngRedux.select<Course[]>([StoreDataTypeEnum.STATIC_DATA, 'courses'])
        .subscribe((courses: Course[]) => {
          if (courses && courses.length > 0) {
            this.coursesMapObsolete = {};
            this.coursesMap = new Map();
            courses.forEach((course: Course) => {
              this.coursesMapObsolete[course.name] = course;
              this.coursesMap.set(course.name, course);
            });
          }
          this.coursesMapObservableObsolete.next(this.coursesMapObsolete);
          this.coursesMapObservable.next(this.coursesMap);
        });

    this.subscriptionsArray.push(coursesSubscription);
  }

  private populateScheduledCoursesArray() {
    const coursesSubscription =
      this.ngRedux.select<CourseSchedule[]>([StoreDataTypeEnum.DYNAMIC_DATA, 'coursesSchedule'])
        .subscribe((courseScheduleArray: CourseSchedule[]) => {
          this.isCourseScheduleArrayEnhanced = false;
          this.courseScheduleArray = courseScheduleArray;
        });

    this.subscriptionsArray.push(coursesSubscription);
  }

  readToStore() {
    this.ngRedux.dispatch(readToStoreData());
  }

  getAreasMap(): Observable<Area[]> {
    return this.areasMapObservable;
  }

  getGongTypesMap(): Observable<GongType[]> {
    return this.gongTypesMapObservable;
  }

  getCoursesMapObsolete(): Observable<{ [key: string]: Course }> {
    return this.coursesMapObservableObsolete;
  }

  getCoursesMap(): Observable<Map<string, Course>> {
    return this.coursesMapObservable;
  }

  async getAreasMapAsync(): Promise<Area[]> {
    return await this.areasMapObservable.toPromise();
  }

  async getGongTypesMapAsync(): Promise<GongType[]> {
    return await this.gongTypesMapObservable.toPromise();
  }

  getCoursesMapSync(): Map<string, Course> {
    return this.coursesMap;
  }

  getCourseScheduleArraySync(): CourseSchedule[] {
    this.enhanceCourseScheduleArray();
    return this.courseScheduleArray;
  }

  addManualGong(gongToPlay: ScheduledGong) {
    this.ngRedux.dispatch(addManualGong(gongToPlay));
  }

  getBasicData() {
    this.ngRedux.dispatch(getBasicData());
  }

  scheduleCourse(aCourseSchedule: CourseSchedule) {
    this.ngRedux.dispatch(scheduleCourse(aCourseSchedule));
  }

  removeScheduledCourse(aCourseScheduledToRemove: CourseSchedule) {
    this.ngRedux.dispatch(removeScheduleCourse(aCourseScheduledToRemove));
  }

  toggleScheduledGong(aScheduledCourseGong: ScheduledCourseGong) {
    this.ngRedux.dispatch(toggleScheduledGong(aScheduledCourseGong));
  }

  private enhanceCourseScheduleArray() {
    if (!this.isCourseScheduleArrayEnhanced) {
      this.courseScheduleArray.forEach((courseSchedule: CourseSchedule) => {
        courseSchedule.daysCount = this.coursesMap.get(courseSchedule.name).days;
      });
      this.isCourseScheduleArrayEnhanced = true;
    }
  }

  ngOnDestroy(): void {
    this.subscriptionsArray.forEach(subscription => subscription.unsubscribe());
    console.log('c1');
  }
}
