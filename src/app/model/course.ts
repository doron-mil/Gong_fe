import {ScheduledGong} from './ScheduledGong';
import {GongType} from './gongType';

export class Course {
  name: string;
  isTest: boolean;
  days: number;
  routine: ScheduledGong[];

  isGongTypeInCourse(aGongType: GongType): boolean {
    return this.routine.some(scheduledGong => scheduledGong.gongTypeId === aGongType.id);
  }
}
