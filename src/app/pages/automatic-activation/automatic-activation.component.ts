import {Component, OnDestroy, OnInit} from '@angular/core';
import {CourseSchedule} from '../../model/courseSchedule';
import {NgRedux} from '@angular-redux/store';
import {Course} from '../../model/course';
import {MatTableDataSource} from '@angular/material';
import {ScheduledGong} from '../../model/ScheduledGong';
import {StoreDataTypeEnum} from '../../store/storeDataTypeEnum';
import {combineLatest, Subscription} from 'rxjs';
import {StoreService} from '../../services/store.service';
import {GongType} from '../../model/gongType';

@Component({
  selector: 'app-automatic-activation',
  templateUrl: './automatic-activation.component.html',
  styleUrls: ['./automatic-activation.component.css']
})
export class AutomaticActivationComponent implements OnInit, OnDestroy {

  coursesDisplayedColumns = ['course_name', 'daysCount', 'date'];
  coursesDataSource: MatTableDataSource<CourseSchedule>;
  coursesData: CourseSchedule[] = [];
  selectedRowIndex: number = -1;

  selectedCourseDisplayedColumns = ['day', 'date', 'isOn', 'time', 'gongType', 'area'];
  selectedCourseDataSource: MatTableDataSource<ScheduledGong>;
  selectedCourseRoutineArray: ScheduledGong[] = [];

  subscription: Subscription;

  constructor(private ngRedux: NgRedux<any>,
              private storeService: StoreService) {
  }

  ngOnInit() {
    const mergedObservable =
      combineLatest(
        this.ngRedux.select<CourseSchedule[]>([StoreDataTypeEnum.DYNAMIC_DATA, 'coursesSchedule']),
        this.storeService.getCoursesMap()
      );

    this.subscription = mergedObservable.subscribe(mergedResult => {
      const coursesSchedule: CourseSchedule[] = mergedResult[0];
      const coursesMap: { [key: string]: Course } = mergedResult[1];
      if (coursesSchedule && coursesMap) {
        coursesSchedule.forEach((courseSchedule: CourseSchedule) => {
          courseSchedule.daysCount = coursesMap[courseSchedule.name].days;
          this.coursesData.push(courseSchedule);
        });
        this.coursesDataSource = new MatTableDataSource<CourseSchedule>(this.coursesData);
      }
    });
  }

  onRowClick(row): void {
    this.selectedRowIndex = row.id;
    this.getCourseRoutine(row);
  }

  private getCourseRoutine(selectedCourseScheduled: CourseSchedule) {
    const selectedCourseStartDate = selectedCourseScheduled.date;
    const selectedCourseName = selectedCourseScheduled.name;

    const mergedObservable =
      combineLatest(
        this.storeService.getCoursesMap(),
        this.storeService.getGongTypesMap()
      );

    this.subscription = mergedObservable.subscribe(mergedResult => {
      const courseMap: { [key: string]: Course } = mergedResult[0];
      const gongTypesMap: GongType[] = mergedResult[1];

      const foundCourse = courseMap[selectedCourseName];

      this.selectedCourseRoutineArray = [];
      if (foundCourse) {
        let lastScheduledGongReord: ScheduledGong = new ScheduledGong();
        foundCourse.routine.forEach(course => {
          const copiedCourse = course.cloneForUi(selectedCourseStartDate);

          copiedCourse.gongTypeName = gongTypesMap[copiedCourse.gongTypeId].name;

          if (copiedCourse.dayNumber !== lastScheduledGongReord.dayNumber) {
            lastScheduledGongReord = copiedCourse;
            lastScheduledGongReord.span = 1;
          } else {
            copiedCourse.span = 0;
            lastScheduledGongReord.span++;
          }

          this.selectedCourseRoutineArray.push(copiedCourse);
        });
        this.selectedCourseDataSource = new MatTableDataSource<ScheduledGong>(this.selectedCourseRoutineArray);

      } else {
        console.error('couldn\'t find course name : ' + selectedCourseName);
      }
    });
  }

  addCourse() {

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  gongToggle() {
    return undefined;
  }
}
