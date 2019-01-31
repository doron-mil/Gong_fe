import {Area} from '../../model/area';
import {Course} from '../../model/course';
import {CourseSchedule} from '../../model/courseSchedule';
import {GongType} from '../../model/gongType';


export interface MainState {
  gongTypes: GongType[];
  areas: Area[];
  courses: Course[];
  coursesSchedule: CourseSchedule[];
}

export const INITIAL_GENERAL_STATE :MainState = {
  gongTypes: [],
  areas: [],
  courses: [],
  coursesSchedule: []
};
