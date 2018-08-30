import {INITIAL_GENERAL_STATE} from '../states/main.state';
import {AppAction} from '../actions/action';

export function generalReducer(state = INITIAL_GENERAL_STATE, action: AppAction): any {

  switch (action.type) {
    // case INSPECTIONS_DATA_SET:
    //   if (action.payload instanceof InventoryInspection) {
    //     return newStateWithInspection();
    //   } else {
    //     return {...state, ...action.payload};
    //   }
    default:
      return state;
  }
}

