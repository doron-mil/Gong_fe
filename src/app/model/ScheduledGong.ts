import * as moment from 'moment';
import {UpdateStatusEnum} from './updateStatusEnum';

export class ScheduledGong {
  dayNumber: number;
  date: Date;
  time: number;
  gongTypeId: number;
  gongTypeName: string;
  areas: number[];
  volume: number;
  isActive: boolean;
  span: number;
  updateStatus: UpdateStatusEnum;

  cloneForUi(courseStartDate?: Date) {
    const clonedObject = new ScheduledGong();
    clonedObject.dayNumber = this.dayNumber;
    clonedObject.gongTypeId = this.gongTypeId;
    clonedObject.areas = this.areas;
    clonedObject.volume = this.volume;
    clonedObject.isActive = this.isActive;

    clonedObject.date = this.date;
    clonedObject.time = this.time;

    if (!clonedObject.date) {
      clonedObject.date = moment(courseStartDate).add(clonedObject.dayNumber, 'd').toDate();
    } else if (!clonedObject.time) {
      clonedObject.time = moment(clonedObject.date).diff(moment(clonedObject.date).startOf('day'));
    }

    if (!clonedObject.dayNumber) {
      clonedObject.dayNumber = parseInt(moment(clonedObject.date).format('DDD'), 10);
    }

    return clonedObject;
  }
}
