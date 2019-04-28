import * as _ from 'lodash';
import {UpdateStatusEnum} from './updateStatusEnum';
import {ScheduledCourseGong} from './ScheduledCourseGong';
import {HoursRange} from './hoursRange';

export class CourseSchedule {
  id: number;
  name: string;
  date: Date;
  daysCount: number;
  startFromDay: number;
  exceptions: ScheduledCourseGong[];
  updateStatus: UpdateStatusEnum;
  tmpId: string;
  testHoursRange?: HoursRange;


  clone(): CourseSchedule {
    const newCourseSchedule = new CourseSchedule();
    newCourseSchedule.id = this.id;
    newCourseSchedule.name = this.name;
    newCourseSchedule.date = this.date;
    newCourseSchedule.daysCount = this.daysCount;
    newCourseSchedule.startFromDay = this.startFromDay;
    newCourseSchedule.updateStatus = this.updateStatus;
    newCourseSchedule.tmpId = this.tmpId;
    if (this.exceptions) {
      newCourseSchedule.exceptions = _.map(this.exceptions, _.clone);

    }
    if (this.testHoursRange) {
      newCourseSchedule.testHoursRange = this.testHoursRange;

    }
    return newCourseSchedule;
  }

  findException(aDayNumber: number, aTimeAtDay: number): ScheduledCourseGong {
    let foundScheduledCourseGong: ScheduledCourseGong;
    if (this.exceptions) {
      foundScheduledCourseGong = this.exceptions.find(
        (scheduledCourseGong: ScheduledCourseGong) =>
          scheduledCourseGong.dayNumber === aDayNumber &&
          scheduledCourseGong.time === aTimeAtDay);
    }

    return foundScheduledCourseGong;
  }

}
