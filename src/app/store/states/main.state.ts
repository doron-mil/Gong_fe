import {Area} from '../../model/area';
import {Course} from '../../model/course';
import {CourseSchedule} from '../../model/courseSchedule';
import {GongType} from '../../model/gongType';


export class MainState {
  gongTypes: GongType[];
  areas: Area[];
  courses: Course[];
  coursesSchedule: CourseSchedule[];
}

export const INITIAL_GENERAL_STATE = new MainState();
