import {GongType} from './gongType';
import {Area} from './area';

export class Gong {
  type: GongType;
  volume: number;
  areaIds: string[];
  isActive: boolean;
  time: Date;
}
