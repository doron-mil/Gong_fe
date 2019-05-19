import * as moment from 'moment';
import {ScheduledGong} from '../../model/ScheduledGong';
import {ClassMapEntry, MethodMapEntry} from '../json-converter/json-converter.service';
import {ScheduledCourseGong} from '../../model/ScheduledCourseGong';

const dateFormat = 'YYYY-MM-DD';

const addNewGongToArray = (aCourseDay, aGongTime, aGongRecord, aGongsArray) => {
  const newScheduledGong = new ScheduledGong();
  newScheduledGong.dayNumber = aCourseDay;
  newScheduledGong.time = aGongTime;
  newScheduledGong.gongTypeId = aGongRecord.type;
  newScheduledGong.areas = aGongRecord.areas;
  newScheduledGong.volume = aGongRecord.volume ? aGongRecord.volume : 100;
  aGongsArray.push(newScheduledGong);
};

const agendaConversion = (coursesAgendaArray: Array<any>): ScheduledGong[] => {
  const returnedScheduledGongArray = new Array<ScheduledGong>();

  coursesAgendaArray.forEach(agendaRecord => {
    (agendaRecord.days as Array<any>).forEach(day => {
      const gongRecord = agendaRecord.gongs;
      (gongRecord.times as Array<any>).forEach(gongTime => {
        const computedGongTime = (gongTime.indexOf(':') > 0) ? gongTime : `0${gongTime}`;
        addNewGongToArray(day, timeConversion(computedGongTime), gongRecord, returnedScheduledGongArray);
      });
    });
  });

  // Sorting the results
  returnedScheduledGongArray.sort((a: ScheduledGong, b: ScheduledGong) => {
    if (a.dayNumber !== b.dayNumber) {
      return a.dayNumber - b.dayNumber;
    } else {
      return a.time - b.time;
    }
  });

  // console.log('Convering Agenda : ', returnedScheduledGongArray);

  return returnedScheduledGongArray;
};

const timeConversion = (timeAsStr: string): number => {
  const timeNumber = moment.duration(timeAsStr).asMilliseconds();
  return timeNumber;
};

const timeToStrConversionForJson = (aTime: number): string => {
  const duration = moment.duration(aTime);
  // const timeStr = `${duration.hours()}:${duration.minutes()}`;
  const timeStr = moment.utc(aTime).format('HH:mm');
  return timeStr;
};

const dateConversion = (dateAsStr: string): Date => {
  const date = moment(dateAsStr, dateFormat).toDate();
  return date;
};

const timeToDateConversion = (time: number): Date => {
  const date = moment(time).toDate();
  return date;
};

const dateToTimeConversionForJson = (date: Date): number => {
  const time = date.getTime();
  return time;
};

const dateToStrDateConversionForJson = (aDate: Date): string => {
  const dateStr = moment(aDate).format(dateFormat);
  return dateStr;
};


export default {
  functionsMapArray: [
    {methodName: 'agendaConversion', method: agendaConversion},
    {methodName: 'timeConversion', method: timeConversion},
    {methodName: 'dateConversion', method: dateConversion},
    {methodName: 'timeToDateConversion', method: timeToDateConversion},
    {methodName: 'dateToTimeConversionForJson', method: dateToTimeConversionForJson},
    {methodName: 'dateToStrDateConversionForJson', method: dateToStrDateConversionForJson},
    {methodName: 'timeToStrConversionForJson', method: timeToStrConversionForJson}
  ] as MethodMapEntry[],
  classesMapArray: [{className: 'ScheduledCourseGong', clazz: ScheduledCourseGong}] as ClassMapEntry[]
};
