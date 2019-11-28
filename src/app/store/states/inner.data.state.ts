import {DateFormat} from '../../model/dateFormat';

export interface InnerDataState {
  isLoggedIn: boolean;
  dateFormat: DateFormat;
  gongPlayEnabled: boolean;
  uploadCoursesFileEnded: number;
  staticDataWasUpdated: Date;
}

export const INITIAL_INNER_DATA_STATE: InnerDataState = {
  isLoggedIn: false,
  dateFormat: new DateFormat('DD/MM/YYYY', '/'),
  gongPlayEnabled: true,
  uploadCoursesFileEnded: 0,
  staticDataWasUpdated: undefined,
};
