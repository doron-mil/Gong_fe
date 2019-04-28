import {ScheduledGong} from './ScheduledGong';

export class Course {
  name: string;
  isTest: boolean;
  days: number;
  routine: ScheduledGong[];
}
