import {CourseSchedule} from '../../model/courseSchedule';
import {ScheduledGong} from '../../model/ScheduledGong';


export interface DynamicDataState {
  coursesSchedule: CourseSchedule[];
  manualGongs: ScheduledGong[];
}

export const INITIAL_DYNAMIC_DATA_STATE: DynamicDataState = {
  coursesSchedule: [],
  manualGongs: []
};
