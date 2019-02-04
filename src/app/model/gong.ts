import {GongType} from './gongType';
import {Area} from './area';
import {UpdateStatusEnum} from './updateStatusEnum';

export class Gong {
  id: number;
  type: GongType;
  volume: number;
  areaIds: number[];
  isActive: boolean;
  time: Date;
  updateStatus: UpdateStatusEnum;
}
