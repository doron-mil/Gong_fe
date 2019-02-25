import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import * as moment from 'moment';
import {Course} from '../../model/course';
import {StoreService} from '../../services/store.service';
import {CourseSchedule} from '../../model/courseSchedule';
import {UpdateStatusEnum} from '../../model/updateStatusEnum';
import {v4 as uuid} from 'uuid';

const dateFormat = 'YY-MM-DD HH:mm:ss';

class MomentRange {
  startMoment: moment.Moment;
  endMoment: moment.Moment;

  constructor(startMoment: moment.Moment, endMoment: moment.Moment) {
    this.startMoment = startMoment;
    this.endMoment = endMoment;
  }

  static createInstanceOutOfCourseSchedule(aCourseSchedule: CourseSchedule): MomentRange {
    return MomentRange.createInstance(aCourseSchedule.date, aCourseSchedule.daysCount, aCourseSchedule.startFromDay);
  }

  static createInstance(aDate: Date | moment.Moment, aDayCount: number, aStartFromDay: number = 0): MomentRange {
    const startMoment = moment(aDate).startOf('day');
    const courseCalculatedDays = aDayCount - aStartFromDay - 1;
    const endMoment = startMoment.clone().add(courseCalculatedDays, 'd');
    return new MomentRange(startMoment, endMoment);
  }

  print() {
    return this.startMoment.format(dateFormat) + ' - ' + this.endMoment.format(dateFormat);
  }
}

@Component({
  selector: 'app-schedule-course-dialog',
  templateUrl: './schedule-course-dialog.component.html',
  styleUrls: ['./schedule-course-dialog.component.css']
})
export class ScheduleCourseDialogComponent implements OnInit {
  isNew: boolean;

  coursesMap: Map<string, Course>;
  courses: Course[] = [];
  selectedCourse: Course;

  startDayArray: number[] = [];
  selectedStartFromDay: number;

  selectedStartDate: Date;
  minStartDate: Date;

  coursesMomentRangeArray: MomentRange[] = [];

  datePickerIsOpened: boolean;

  constructor(public dialogRef: MatDialogRef<any>,
              private storeService: StoreService) {
  }

  ngOnInit() {
    this.coursesMap = this.storeService.getCoursesMapSync();
    this.coursesMap.forEach(value => this.courses.push(value));

    const courseScheduleArray = this.storeService.getCourseScheduleArraySync();
    courseScheduleArray.forEach((courseSchedule: CourseSchedule) => {
      const momentRange = MomentRange.createInstanceOutOfCourseSchedule(courseSchedule);
      this.coursesMomentRangeArray.push(momentRange);
    });

    this.selectedStartDate = new Date();
  }

  closeDialog(aCourseSchedule: CourseSchedule = null): void {
    this.dialogRef.close(aCourseSchedule);
  }

  onCourseSelectedChange() {
    this.startDayArray = Array.from(Array(this.selectedCourse.days).keys());
    this.selectedStartFromDay = 0;
    this.recalculateStartDate();
  }

  private recalculateStartDate() {
    const newStartDate = moment();

    while (!this.dateFilter(newStartDate)) {
      newStartDate.add(1, 'd');
    }

    this.selectedStartDate = newStartDate.toDate();
    this.minStartDate = this.selectedStartDate;
  }

  onStartFromDaySelectedChange() {
    this.recalculateStartDate();
  }

  scheduleCourse() {
    if (this.selectedCourse) {
      const courseSchedule = new CourseSchedule();
      courseSchedule.tmpId = uuid();
      courseSchedule.name = this.selectedCourse.name;
      courseSchedule.date = this.selectedStartDate;
      courseSchedule.startFromDay = this.selectedStartFromDay;
      courseSchedule.updateStatus = UpdateStatusEnum.PENDING;
      this.closeDialog(courseSchedule);
    }
  }

  openDatePicker() {
    this.datePickerIsOpened = true;
  }

  dateFilter = (aDate: Date | moment.Moment, isLog: boolean = false): boolean => {
    const selectedMomentRange = MomentRange.createInstance(aDate, this.selectedCourse.days, this.selectedStartFromDay);

    return !this.coursesMomentRangeArray.some((aMomentRange: MomentRange) => {
      const startMoment = selectedMomentRange.startMoment;
      const endMoment = selectedMomentRange.endMoment;
      const retValue = (
        startMoment.isBetween(aMomentRange.startMoment, aMomentRange.endMoment, null, '[]') ||
        endMoment.isBetween(aMomentRange.startMoment, aMomentRange.endMoment, null, '[]') ||
        aMomentRange.startMoment.isBetween(startMoment, endMoment, null, '[]') ||
        aMomentRange.endMoment.isBetween(startMoment, endMoment, null, '[]')
      );
      if (isLog) {
        console.log(`dateFilter log value = ${retValue}\n\t\t`, new MomentRange(startMoment, endMoment).print(),
          '\n\t\t', aMomentRange.print());
      }

      return retValue;
    });
  };

}
