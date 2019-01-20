import {INITIAL_GENERAL_STATE, MainState} from '../states/main.state';
import {AppAction, SET_AREAS, SET_COURSES, SET_COURSES_SCHEDULE, SET_GONG_TYPES} from '../actions/action';

export function generalReducer(state: MainState = INITIAL_GENERAL_STATE, action: AppAction): any {

  switch (action.type) {
    case SET_GONG_TYPES:
      state.gongTypes = action.payload.data;
      return state;
    case SET_AREAS:
      state.areas = action.payload;
      return state;
    case SET_COURSES:
      state.courses = action.payload;
      return state;
    case SET_COURSES_SCHEDULE:
      state.coursesSchedule = action.payload;
      return state;
    default:
      return state;
  }
}

