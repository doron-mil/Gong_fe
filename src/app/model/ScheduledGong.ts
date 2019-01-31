import * as moment from 'moment';

export class ScheduledGong {
  dayNumber: number;
  date: Date;
  time: number;
  gongTypeId: number;
  gongTypeName: string;
  areas: number[];
  span: number;

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
