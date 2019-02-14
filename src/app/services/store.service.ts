import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {NgRedux} from '@angular-redux/store';
import {Area} from '../model/area';
import {TranslateService} from '@ngx-translate/core';
import {StoreDataTypeEnum} from '../store/storeDataTypeEnum';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {GongType} from '../model/gongType';
import {Course} from '../model/course';
import {addManualGong, readToStoreData} from '../store/actions/action';
import {ScheduledGong} from '../model/ScheduledGong';

@Injectable({
  providedIn: 'root'
})
export class StoreService implements OnInit, OnDestroy {

  private areasMapObservable: BehaviorSubject<Area[]> = new BehaviorSubject<Area[]>([]);
  private gongTypesMapObservable: BehaviorSubject<GongType[]> = new BehaviorSubject<GongType[]>([]);
  private coursesMapObservable: BehaviorSubject<{ [key: string]: Course }> =
    new BehaviorSubject<{ [key: string]: Course }>({});

  areasMap: Area[] = [];
  gongTypesMap: GongType[] = [];
  coursesMap: { [key: string]: Course } = {};

  subscriptionsArray: Subscription[] = [];

  constructor(private ngRedux: NgRedux<any>,
              private translateService: TranslateService) {
    this.populateAreasMap();
    this.populateGongTypesMap();
    this.populateGongTypeCoursesMap();
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
            this.coursesMap = {};
            courses.forEach((course: Course) => {
              this.coursesMap[course.name] = course;
            });
          }
          this.coursesMapObservable.next(this.coursesMap);
        });

    this.subscriptionsArray.push(coursesSubscription);
  }


  ngOnInit(): void {
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

  getCoursesMap(): Observable<{ [key: string]: Course }> {
    return this.coursesMapObservable;
  }

  async getAreasMapAsync(): Promise<Area[]> {
    return await this.areasMapObservable.toPromise();
  }

  async getGongTypesMapAsync(): Promise<GongType[]> {
    return await this.gongTypesMapObservable.toPromise();
  }

  async getCoursesMapAsync(): Promise<{ [key: string]: Course }> {
    return await this.coursesMapObservable.toPromise();
  }

  ngOnDestroy(): void {
    this.subscriptionsArray.forEach(subscription => subscription.unsubscribe());
    console.log('c1');
  }


  addManualGong(gongToPlay: ScheduledGong) {
    this.ngRedux.dispatch(addManualGong(gongToPlay));
  }
}
