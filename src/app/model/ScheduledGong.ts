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

  cloneForUi(courseStartDate: Date) {
    const clonedObject = new ScheduledGong();
    clonedObject.dayNumber = this.dayNumber;
    clonedObject.time = this.time;
    clonedObject.gongTypeId = this.gongTypeId;
    clonedObject.areas = this.areas;

    clonedObject.date = moment(courseStartDate).add(clonedObject.dayNumber, 'd').toDate();

    return clonedObject;
  }
}
