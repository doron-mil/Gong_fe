import {Action} from 'redux';
import {Area} from '../../model/area';
import {Course} from '../../model/course';
import {CourseSchedule} from '../../model/courseSchedule';
import {GongType} from '../../model/gongType';
import {ScheduledGong} from '../../model/ScheduledGong';

export const GONG_TYPES_FEATURE = '[GONG_TYPES]';
export const AREA_FEATURE = '[AREA]';
export const COURSES_FEATURE = '[COURSES]';
export const COURSES_SCHEDULE_FEATURE = '[COURSES_SCHEDULE]';
export const MANUAL_GONGS_LIST_FEATURE = '[MANUAL_GONGS_LIST]';
export const MANUAL_GONG_ADD_FEATURE = '[MANUAL_GONG_ADD]';


export const READ_TO_STORE_DATA = 'READ_TO_STORE_DATA';
export const SET_GONG_TYPES = 'SET_GONG_TYPES';
export const SET_AREAS = 'SET_AREAS';
export const SET_COURSES = 'SET_COURSES';
export const SET_COURSES_SCHEDULE = 'SET_COURSES_SCHEDULE';
export const SET_MANUAL_GONGS_LIST = 'SET_MANUAL_GONGS_LIST';
export const ADD_MANUAL_GONG = 'ADD_MANUAL_GONG';
export const UPDATE_MANUAL_GONG = 'UPDATE_MANUAL_GONG';

export interface AppAction extends Action {
  payload: any;
}

// action creators
export const readToStoreData = () => ({
  type: `READ_TO_STORE_DATA`
});

export const setGongTypes = (gongTypes: GongType[]) => ({
  type: SET_GONG_TYPES,
  payload: gongTypes,
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

export const setManualGongsList = (scheduledGongsArray: ScheduledGong[]) => ({
  type: SET_MANUAL_GONGS_LIST,
  payload: scheduledGongsArray,
  meta: {feature: MANUAL_GONGS_LIST_FEATURE}
});

export const addManualGong = (manualGong: ScheduledGong) => ({
  type: ADD_MANUAL_GONG,
  payload: manualGong,
  meta: {feature: MANUAL_GONG_ADD_FEATURE}
});

export const updateManualGong = (manualGong: ScheduledGong) => ({
  type: UPDATE_MANUAL_GONG,
  payload: manualGong,
  meta: {feature: MANUAL_GONG_ADD_FEATURE}
});
