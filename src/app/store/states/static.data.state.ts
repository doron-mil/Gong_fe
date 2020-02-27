import {Area} from '../../model/area';
import {Course} from '../../model/course';
import {GongType} from '../../model/gongType';
import {User} from '../../model/user';
import {Permission} from '../../model/permission';


export interface StaticDataState {
  gongTypes: GongType[];
  areas: Area[];
  courses: Course[];
  coursesRawData: string;
  users: User[];
  permissions: Permission[];
}

export const INITIAL_STATIC_DATA_STATE: StaticDataState = {
  gongTypes: [],
  areas: [],
  courses: [],
  coursesRawData: '',
  users: [],
  permissions: [],
};
