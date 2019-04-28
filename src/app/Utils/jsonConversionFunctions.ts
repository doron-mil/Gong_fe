import {
  ConversionFunctionsType,
  JsonConverterConfigurationInterface
} from './json-converter/json-converter.service';
import {ScheduledGong} from '../model/ScheduledGong';
import * as moment from 'moment';
import {ScheduledCourseGong} from '../model/ScheduledCourseGong';

const addNewGongToArray = (aCourseDay, aGongTime, aGongRecord, aGongsArray) => {
  const newScheduledGong = new ScheduledGong();
  newScheduledGong.dayNumber = aCourseDay;
  newScheduledGong.time = aGongTime;
  newScheduledGong.gongTypeId = aGongRecord.type;
  newScheduledGong.areas = aGongRecord.areas;
  newScheduledGong.volume = aGongRecord.volume ? aGongRecord.volume : 100;
  aGongsArray.push(newScheduledGong);
};

export class JsonConversionFunctions implements JsonConverterConfigurationInterface {
  conversionFunctions: ConversionFunctionsType = {};

  private dateFormat = 'YYYY-MM-DD';

  converterMainMethodOverride = undefined;

  classesMap = new Map<string, { new() }>();

  static getInstance(): JsonConversionFunctions {
    const jsonConversionFunctions = new JsonConversionFunctions();
    return jsonConversionFunctions;
  }

  getConfigurationFilePath = () => 'assets/json-converter/gong-conversion-schema.json';

  constructor() {
    this.conversionFunctions['agendaConversion'] = this.agendaConversion;
    this.conversionFunctions['timeConversion'] = this.timeConversion;
    this.conversionFunctions['dateConversion'] = this.dateConversion;
    this.conversionFunctions['timeToDateConversion'] = this.timeToDateConversion;
    this.conversionFunctions['dateToTimeConversionForJson'] = this.dateToTimeConversionForJson;
    this.conversionFunctions['dateToStrDateConversionForJson'] = this.dateToStrDateConversionForJson;
    this.conversionFunctions['timeToStrConversionForJson'] = this.timeToStrConversionForJson;

    this.classesMap.set('ScheduledCourseGong', ScheduledCourseGong);
  }

  agendaConversion = (coursesAgendaArray: Array<any>): ScheduledGong[] => {
    const returnedScheduledGongArray = new Array<ScheduledGong>();

    let scheduledGong: ScheduledGong;

    coursesAgendaArray.forEach(agendaRecord => {
      (agendaRecord.days as Array<any>).forEach(day => {
        const gongRecord = agendaRecord.gongs;
        (gongRecord.times as Array<any>).forEach(gongTime => {
          const computedGongTime = (gongTime.indexOf(':') > 0) ? gongTime : `0${gongTime}`;
          addNewGongToArray(day, this.timeConversion(computedGongTime), gongRecord, returnedScheduledGongArray);
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

  timeConversion = (timeAsStr: string): number => {
    const timeNumber = moment.duration(timeAsStr).asMilliseconds();
    return timeNumber;
  };

  timeToStrConversionForJson = (aTime: number): string => {
    const duration = moment.duration(aTime);
    // const timeStr = `${duration.hours()}:${duration.minutes()}`;
    const timeStr = moment.utc(aTime).format('HH:mm');
    return timeStr;
  };

  dateConversion = (dateAsStr: string): Date => {
    const date = moment(dateAsStr, this.dateFormat).toDate();
    return date;
  };

  timeToDateConversion = (time: number): Date => {
    const date = moment(time).toDate();
    return date;
  };

  dateToTimeConversionForJson = (date: Date): number => {
    const time = date.getTime();
    return time;
  };

  dateToStrDateConversionForJson = (aDate: Date): string => {
    const dateStr = moment(aDate).format(this.dateFormat);
    return dateStr;
  };
}
