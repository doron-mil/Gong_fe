import {INITIAL_INNER_DATA_STATE, InnerDataState} from '../states/inner.data.state';
import {ActionTypesEnum, AppAction} from '../actions/action';

import {DateFormat} from '../../model/dateFormat';

export function innerReducer(state: InnerDataState = INITIAL_INNER_DATA_STATE,
                             action: AppAction): any {

  switch (action.type) {
    case ActionTypesEnum.SET_LOGGED_IN:
      state.isLoggedIn = action.payload as boolean;
      return state;
    case ActionTypesEnum.STORE_STATIC_DATA_WAS_UPDATED:
      state.staticDataWasUpdated = new Date();
      return state;
    case ActionTypesEnum.SET_DATE_FORMAT:
      const oldDateFormat = action.payload as DateFormat;
      const newDateFormat = new DateFormat(oldDateFormat.template, oldDateFormat.delimiter);
      return Object.assign({}, state, {dateFormat: newDateFormat});
    case ActionTypesEnum.SET_PLAY_GONG_ENABLED:
      state.gongPlayEnabled = action.payload as boolean;
      return Object.assign({}, state);
    case ActionTypesEnum.UPLOAD_COURSES_FILE_WAS_COMPLETED:
      state.uploadCoursesFileEnded = state.uploadCoursesFileEnded + 1;
      return state;
    default:
      return Object.assign({}, state);
  }
}

