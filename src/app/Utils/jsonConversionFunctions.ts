import {
  ConversionFunctionsType,
  JsonConverterConfigurationInterface
} from './json-converter/json-converter.service';
import {ScheduledGong} from '../model/ScheduledGong';
import * as moment from 'moment';

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

  converterMainMethodOverride = undefined;

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
  }

  agendaConversion = (coursesAgendaArray: Array<any>): ScheduledGong[] => {
    const returnedScheduledGongArray = new Array<ScheduledGong>();

    let scheduledGong: ScheduledGong;

    coursesAgendaArray.forEach(agendaRecord => {
      (agendaRecord.days as Array<any>).forEach(day => {
        const gongRecord = agendaRecord.gongs;
        (gongRecord.times as Array<any>).forEach(gongTime => {
          if (gongTime.indexOf(':') > 0) {
            addNewGongToArray(day, this.timeConversion(gongTime), gongRecord, returnedScheduledGongArray);
          } else {
            for (let hourInDay = 7; hourInDay < 8; hourInDay += 1) { // 0 .. < 24
              addNewGongToArray(day, this.timeConversion(hourInDay + gongTime), gongRecord, returnedScheduledGongArray);
            }
          }
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

  dateConversion = (dateAsStr: string): Date => {
    const date = moment(dateAsStr, 'YYYY-MM-DD').toDate();
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
}
