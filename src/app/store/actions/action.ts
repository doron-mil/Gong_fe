import {Action} from 'redux';
import {Area} from '../../model/area';
import {Course} from '../../model/course';
import {CourseSchedule} from '../../model/courseSchedule';

export const GONG_TYPES_FEATURE = '[GONG_TYPES]';
export const AREA_FEATURE = '[AREA]';
export const COURSES_FEATURE = '[COURSES]';
export const COURSES_SCHEDULE_FEATURE = '[COURSES_SCHEDULE]';


export const READ_TO_STORE_DATA = 'READ_TO_STORE_DATA';
export const SET_GONG_TYPES = 'SET_GONG_TYPES';
export const SET_AREAS = 'SET_AREAS';
export const SET_COURSES = 'SET_COURSES';
export const SET_COURSES_SCHEDULE = 'SET_COURSES_SCHEDULE';

export interface AppAction extends Action {
  payload: any;
}

// action creators
export const readToStoreData = () => ({
  type: `READ_TO_STORE_DATA`
});

export const setGongTypes = (GongTypes: Area[]) => ({
  type: SET_GONG_TYPES,
  payload: GongTypes,
  meta: {feature: GONG_TYPES_FEATURE}
});

export const setAreas = (areas: Area[]) => ({
  type: SET_AREAS,
  payload: areas,
  meta: {feature: AREA_FEATURE}
});

export const setCourses = (courses: Course[]) => ({
  type: SET_COURSES,
  payload: courses,
  meta: {feature: COURSES_FEATURE}
});

export const setCoursesSchedule = (coursesSchedule: CourseSchedule[]) => ({
  type: SET_COURSES_SCHEDULE,
  payload: coursesSchedule,
  meta: {feature: COURSES_SCHEDULE_FEATURE}
});
