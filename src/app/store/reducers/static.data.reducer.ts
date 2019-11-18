import {ActionTypesEnum, AppAction} from '../actions/action';
import {INITIAL_STATIC_DATA_STATE, StaticDataState} from '../states/static.data.state';

export function staticDataReducer(state: StaticDataState = INITIAL_STATIC_DATA_STATE,
                               action: AppAction): any {

  switch (action.type) {
    case ActionTypesEnum.SET_GONG_TYPES:
      return Object.assign({}, state, {gongTypes: action.payload});
    case ActionTypesEnum.SET_AREAS:
      return Object.assign({}, state, {areas: action.payload});
    case ActionTypesEnum.SET_COURSES:
      return Object.assign({}, state, {courses: action.payload});
    case ActionTypesEnum.SET_COURSES_RAW_DATA:
      state.coursesRawData = action.payload
      return state;
    default:
      return Object.assign({}, state);
  }
}

