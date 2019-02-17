import {
  ADD_MANUAL_GONG,
  AppAction,
  BASIC_DATA_FEATURE, SET_BASIC_DATA,
  SET_COURSES_SCHEDULE,
  SET_MANUAL_GONGS_LIST,
  UPDATE_MANUAL_GONG
} from '../actions/action';
import {DynamicDataState, INITIAL_DYNAMIC_DATA_STATE} from '../states/dynamic.data.state';
import {Gong} from '../../model/gong';
import {ScheduledGong} from '../../model/ScheduledGong';

export function dynamicDataReducer(state: DynamicDataState = INITIAL_DYNAMIC_DATA_STATE,
                                   action: AppAction): any {

  switch (action.type) {
    case SET_BASIC_DATA:
      return Object.assign({}, state, {basicServerData: action.payload});
    case SET_COURSES_SCHEDULE:
      return Object.assign({}, state, {coursesSchedule: action.payload});
    case SET_MANUAL_GONGS_LIST:
      return Object.assign({}, state, {manualGongs: action.payload});
    case ADD_MANUAL_GONG:
      const newState = Object.assign({}, state);
      newState.manualGongs = [...state.manualGongs];
      newState.manualGongs.push(action.payload);
      return newState;
    case UPDATE_MANUAL_GONG:
      const updatedGong = action.payload as ScheduledGong;
      if (state.manualGongs) {
        const foundGong = state.manualGongs.find(gong => gong.date === updatedGong.date);
        if (foundGong) {
          foundGong.isActive = updatedGong.isActive;
          foundGong.updateStatus = updatedGong.updateStatus;
        }
      }
      return Object.assign({}, state);
    default:
      return Object.assign({}, state);
  }
}

