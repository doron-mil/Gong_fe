import {CourseSchedule} from '../../model/courseSchedule';
import {ScheduledGong} from '../../model/ScheduledGong';
import {BasicServerData} from '../../model/basicServerData';


export interface DynamicDataState {
  coursesSchedule: CourseSchedule[];
  manualGongs: ScheduledGong[];
  basicServerData: BasicServerData;
}

export const INITIAL_DYNAMIC_DATA_STATE: DynamicDataState = {
  coursesSchedule: [],
  manualGongs: [],
  basicServerData: undefined
};
