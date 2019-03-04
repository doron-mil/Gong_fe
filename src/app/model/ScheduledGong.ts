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

  // Only used internally - not initialized
  updateStatus: UpdateStatusEnum;
  exactMoment: moment.Moment;
  span: number;
  isAfterNextGong: boolean;
  isTheNextGong: boolean;

  clone(): ScheduledGong {
    const clonedObject = new ScheduledGong();
    clonedObject.dayNumber = this.dayNumber;
    clonedObject.gongTypeId = this.gongTypeId;
    clonedObject.areas = this.areas;
    clonedObject.volume = this.volume;
    clonedObject.isActive = this.isActive;

    clonedObject.date = this.date;
    clonedObject.time = this.time;

    clonedObject.span = this.span;

    clonedObject.updateStatus = this.updateStatus;
    clonedObject.exactMoment = this.exactMoment;

    clonedObject.isAfterNextGong = this.isAfterNextGong;
    clonedObject.isTheNextGong = this.isTheNextGong;

    return clonedObject;
  }

  cloneForUi(courseStartDate?: Date): ScheduledGong {
    const clonedObject = this.clone();

    if (!clonedObject.date) { // Setting the exact date - used mostly for courses
      clonedObject.exactMoment = moment(courseStartDate).add(clonedObject.dayNumber, 'd');
      clonedObject.date = clonedObject.exactMoment.toDate();
      clonedObject.exactMoment.add(clonedObject.time, 'ms');
    } else if (!clonedObject.time) {  // If there is a date and no time -
      // probably a manual gong that needs time of the day calculation
      clonedObject.exactMoment = moment(clonedObject.date);
      clonedObject.time = clonedObject.exactMoment.diff(clonedObject.exactMoment.clone().startOf('day'));
    }

    // To differentiate between manual gongs with the same date
    if (!clonedObject.dayNumber && clonedObject.dayNumber !== 0) {
      clonedObject.dayNumber = parseInt(moment(clonedObject.date).format('DDD'), 10);
    }

    return clonedObject;
  }
}
