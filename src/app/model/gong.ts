import {GongType} from './gongType';
import {UpdateStatusEnum} from './updateStatusEnum';
import {ScheduledGong} from './ScheduledGong';

export class Gong {
  gongTypeId: number;
  volume: number;
  areas: number[];
  repeat: number;

  static createOutOfScheduledGong(aScheduledGong: ScheduledGong) {
    const newGong = new Gong();
    newGong.gongTypeId = aScheduledGong.gongTypeId;
    newGong.areas = [...aScheduledGong.areas];
    newGong.volume = aScheduledGong.volume;
    newGong.repeat = aScheduledGong.repeat;
    return newGong;
  }
}
