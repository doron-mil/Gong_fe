import {UpdateStatusEnum} from './updateStatusEnum';

export class CourseSchedule {
  id: number;
  name: string;
  date: Date;
  daysCount: number;
  startFromDay: number;
  updateStatus: UpdateStatusEnum;
  tmpId: string;

  clone(): CourseSchedule {
    const newCourseSchedule = new CourseSchedule();
    newCourseSchedule.id = this.id;
    newCourseSchedule.name = this.name;
    newCourseSchedule.date = this.date;
    newCourseSchedule.daysCount = this.daysCount;
    newCourseSchedule.startFromDay = this.startFromDay;
    newCourseSchedule.updateStatus = this.updateStatus;
    newCourseSchedule.tmpId = this.tmpId;
    return newCourseSchedule;
  }
}
