import {Component, OnInit} from '@angular/core';
import {CourseSchedule} from '../../model/courseSchedule';
import {NgRedux} from '@angular-redux/store';
import {MainState} from '../../store/states/main.state';
import {Area} from '../../model/area';
import {Course} from '../../model/course';
import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-automatic-activation',
  templateUrl: './automatic-activation.component.html',
  styleUrls: ['./automatic-activation.component.css']
})
export class AutomaticActivationComponent implements OnInit {

  displayedColumns = ['course_name', 'daysCount', 'date'];
  coursesDataSource: MatTableDataSource<CourseSchedule>;
  coursesData: CourseSchedule[] = [];
  coursesMap: Course[] = [];
  selectedRowIndex: number = -1;

  constructor(private ngRedux: NgRedux<any>) {
  }

  ngOnInit() {
    this.ngRedux.subscribe(() => {
      const state = this.ngRedux.getState().general;
      const mainState = state as MainState;
      const courses = mainState.courses;
      const coursesSchedule = mainState.coursesSchedule;

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
    });

  }

  addCourse() {

  }

  onRowClick(row): void {
    this.selectedRowIndex = row.id;
  }
}
