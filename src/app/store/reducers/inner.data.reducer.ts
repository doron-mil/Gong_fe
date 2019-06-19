import {INITIAL_INNER_DATA_STATE, InnerDataState} from '../states/inner.data.state';
import {AppAction, SET_DATE_FORMAT} from '../actions/action';
import {DateFormat} from '../../model/dateFormat';

export function innerReducer(state: InnerDataState = INITIAL_INNER_DATA_STATE,
                             action: AppAction): any {

  switch (action.type) {
    case SET_DATE_FORMAT:
      const oldDateFormat = action.payload as DateFormat;
      const newDateFormat = new DateFormat(oldDateFormat.template, oldDateFormat.delimiter);
      return Object.assign({}, {dateFormat: newDateFormat});
    default:
      return Object.assign({}, state);
  }
}

