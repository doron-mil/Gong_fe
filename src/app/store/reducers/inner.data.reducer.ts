import {INITIAL_INNER_DATA_STATE, InnerDataState} from '../states/inner.data.state';
import {AppAction, SET_DATE_FORMAT, SET_PLAY_GONG_ENABLED} from '../actions/action';
import {DateFormat} from '../../model/dateFormat';

export function innerReducer(state: InnerDataState = INITIAL_INNER_DATA_STATE,
                             action: AppAction): any {

  switch (action.type) {
    case SET_DATE_FORMAT:
      const oldDateFormat = action.payload as DateFormat;
      const newDateFormat = new DateFormat(oldDateFormat.template, oldDateFormat.delimiter);
      return Object.assign({}, state,{dateFormat: newDateFormat});
    case SET_PLAY_GONG_ENABLED:
      state.gongPlayEnabled = action.payload as boolean;
      return Object.assign({}, state);
    default:
      return Object.assign({}, state);
  }
}

