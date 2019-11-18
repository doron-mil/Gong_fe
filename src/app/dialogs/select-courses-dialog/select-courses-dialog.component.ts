import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CourseSchedule} from '../../model/courseSchedule';
import {UpdateStatusEnum} from '../../model/updateStatusEnum';

@Component({
  selector: 'app-select-courses-dialog',
  templateUrl: './select-courses-dialog.component.html',
  styleUrls: ['./select-courses-dialog.component.scss']
})
export class SelectCoursesDialogComponent implements OnInit {

  selectedCourses: string[] = [];

  constructor(public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: { availableCourses: string[], forAction: string }) {
  }

  ngOnInit() {
  }

  closeDialog(aSelectedCourseNames: string[] = null): void {
    this.dialogRef.close(aSelectedCourseNames);
  }

  submit() {
    if (this.selectedCourses.length > 0) {
      this.closeDialog(this.selectedCourses);
    }
  }

  toggleSelection(aClickedCourse: string) {
    const courseIndex = this.selectedCourses.indexOf(aClickedCourse);
    if (courseIndex >= 0) {
      this.selectedCourses.splice(courseIndex, 1);
    } else {
      this.selectedCourses.push(aClickedCourse);
    }
  }
}
