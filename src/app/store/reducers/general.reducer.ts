import {INITIAL_GENERAL_STATE, MainState} from '../states/main.state';
import {AppAction, SET_AREAS, SET_COURSES, SET_COURSES_SCHEDULE, SET_GONG_TYPES} from '../actions/action';

export function generalReducer(state: MainState = INITIAL_GENERAL_STATE, action: AppAction): any {

  switch (action.type) {
    case SET_GONG_TYPES:
      // state.gongTypes = action.payload.data;
      return Object.assign({}, state, {gongTypes: action.payload.data});
    case SET_AREAS:
      // state.areas = action.payload;
      return Object.assign({}, state, {areas: action.payload});
    case SET_COURSES:
      // state.courses = action.payload;
      return Object.assign({}, state, {courses: action.payload});
    case SET_COURSES_SCHEDULE:
      // state.coursesSchedule = action.payload;
      return Object.assign({}, state, {coursesSchedule: action.payload});
    default:
      return Object.assign({}, state);
      ;
  }
}

