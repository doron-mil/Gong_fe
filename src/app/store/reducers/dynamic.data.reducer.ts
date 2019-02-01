import {AppAction, SET_COURSES_SCHEDULE} from '../actions/action';
import {DynamicDataState, INITIAL_DYNAMIC_DATA_STATE} from '../states/dynamic.data.state';

export function dynamicDataReducer(state: DynamicDataState = INITIAL_DYNAMIC_DATA_STATE,
                               action: AppAction): any {

  switch (action.type) {
    case SET_COURSES_SCHEDULE:
      return Object.assign({}, state, {coursesSchedule: action.payload});
    default:
      return Object.assign({}, state);
  }
}

