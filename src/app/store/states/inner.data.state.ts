import {DateFormat} from '../../model/dateFormat';

export interface InnerDataState {
  dateFormat: DateFormat;
}

export const INITIAL_INNER_DATA_STATE: InnerDataState = {
  dateFormat: new DateFormat('DD/MM/YYYY', '/'),
};
