import {Area} from '../../model/area';
import {Course} from '../../model/course';
import {GongType} from '../../model/gongType';


export interface StaticDataState {
  gongTypes: GongType[];
  areas: Area[];
  courses: Course[];
}

export const INITIAL_STATIC_DATA_STATE: StaticDataState = {
  gongTypes: [],
  areas: [],
  courses: [],
};
