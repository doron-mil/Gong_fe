import * as _ from 'lodash';

export const generalMiddleware = ({getState, dispatch}) => (next) => (action) => {
  next(action);

  switch (action.type) {
    // case ALL_DATA_SET:
    //   const payload = action.payload;
    //   dispatch(loadWorkArraysAction(payload));
  }
};
