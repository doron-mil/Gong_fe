import {
  ConversionFunctionsType,
  JsonConverterConfigurationInterface
} from './json-converter/json-converter.service';
import {ScheduledGong} from '../model/ScheduledGong';
import * as moment from 'moment';


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
  }

  agendaConversion = (coursesAgendaArray: Array<any>): ScheduledGong[] => {
    const returnedScheduledGongArray = new Array<ScheduledGong>();

    let scheduledGong: ScheduledGong;

    coursesAgendaArray.forEach(agendaRecord => {
      (agendaRecord.days as Array<any>).forEach(day => {
        const gongRecord = agendaRecord.gongs;
        (gongRecord.times as Array<any>).forEach(gongTime => {
          scheduledGong = new ScheduledGong();
          scheduledGong.dayNumber = day;
          scheduledGong.time = this.timeConversion(gongTime);
          scheduledGong.gongTypeId = gongRecord.type;
          scheduledGong.areas = gongRecord.areas;
          returnedScheduledGongArray.push(scheduledGong);
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
}
