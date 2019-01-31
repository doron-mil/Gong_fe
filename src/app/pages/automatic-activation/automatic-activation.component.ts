import {Component, OnDestroy, OnInit} from '@angular/core';
import {CourseSchedule} from '../../model/courseSchedule';
import {NgRedux} from '@angular-redux/store';
import {MainState} from '../../store/states/main.state';
import {Area} from '../../model/area';
import {Course} from '../../model/course';
import {MatTableDataSource} from '@angular/material';
import {ScheduledGong} from '../../model/ScheduledGong';
import {StoreDataTypeEnum} from '../../store/storeDataTypeEnum';
import {Subscription} from 'rxjs';
import {Unsubscribe} from 'redux';

@Component({
  selector: 'app-automatic-activation',
  templateUrl: './automatic-activation.component.html',
  styleUrls: ['./automatic-activation.component.css']
})
export class AutomaticActivationComponent implements OnInit, OnDestroy {

  conversionGongTypesMap: { [key: number]: string; } = {};

  coursesDisplayedColumns = ['course_name', 'daysCount', 'date'];
  coursesDataSource: MatTableDataSource<CourseSchedule>;
  coursesData: CourseSchedule[] = [];
  coursesMap: Course[] = [];
  selectedRowIndex: number = -1;

  selectedCourseDisplayedColumns = ['day', 'date', 'isOn', 'time', 'gongType', 'area'];
  selectedCourseDataSource: MatTableDataSource<ScheduledGong>;
  selectedCourseRoutineArray: ScheduledGong[] = [];

  subscription: Subscription;

  constructor(private ngRedux: NgRedux<any>) {
  }

  ngOnInit() {
    this.subscription = this.ngRedux.select(StoreDataTypeEnum.GENERAL).subscribe((mainState: MainState) => {
      const courses = mainState.courses;
      const coursesSchedule = mainState.coursesSchedule;

      this.coursesMap = [];
      this.coursesData = [];
      if (courses) {
        courses.forEach(course => this.coursesMap[course.name] = course);
      }
      if (coursesSchedule && courses) {

        coursesSchedule.forEach((courseSchedule: CourseSchedule) => {
          courseSchedule.daysCount = this.coursesMap[courseSchedule.name].days;
          this.coursesData.push(courseSchedule);
        });
        this.coursesDataSource = new MatTableDataSource<CourseSchedule>(this.coursesData);
      }

      this.conversionGongTypesMap = {};
      if (mainState.gongTypes) {
        mainState.gongTypes.forEach(gong => {
          this.conversionGongTypesMap[gong.id] = gong.name;
        });
      }
    });

  }

  addCourse() {

  }

  onRowClick(row): void {
    this.selectedRowIndex = row.id;
    this.getCourseRoutine(row);
  }

  private getCourseRoutine(selectedCourseScheduled: CourseSchedule) {
    const selectedCourseStartDate = selectedCourseScheduled.date;
    const selectedCourseName = selectedCourseScheduled.name;

    const mainState = this.ngRedux.getState().general as MainState;
    const courses = mainState.courses;

    const foundCourse = courses.find(course => course.name === selectedCourseName);

    this.selectedCourseRoutineArray = [];
    if (foundCourse) {
      let lastScheduledGongReord: ScheduledGong = new ScheduledGong();
      foundCourse.routine.forEach(course => {
        const copiedCourse = course.cloneForUi(selectedCourseStartDate);

        copiedCourse.gongTypeName = this.conversionGongTypesMap[copiedCourse.gongTypeId];

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

  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
