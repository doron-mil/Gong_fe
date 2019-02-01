import {CourseSchedule} from '../../model/courseSchedule';


export interface DynamicDataState {
  coursesSchedule: CourseSchedule[];
}

export const INITIAL_DYNAMIC_DATA_STATE: DynamicDataState = {
  coursesSchedule: []
};
