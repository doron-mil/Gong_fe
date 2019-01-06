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
          courseSchedule.daysCount = this.coursesMap[courseSchedule.name].days_count;
          console.log('bbbbb', courseSchedule,courseSchedule.name ,this.coursesMap, this.coursesMap[courseSchedule.name]);
          this.coursesData.push(courseSchedule);
        });
        this.coursesDataSource = new MatTableDataSource<CourseSchedule>(this.coursesData);
      }

      console.log('aaaaa', this.coursesDataSource);
    });

  }

}
