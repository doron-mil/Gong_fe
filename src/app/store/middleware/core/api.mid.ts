import {API_REQUEST, apiError, apiSuccess} from '../../actions/api.actions';

export const apiMiddleware = ({dispatch}) => (next) => (action) => {
  next(action);

  if (action.type.includes(API_REQUEST)) {
    const {body, url, method, feature} = action.meta;

    fetch(url, {body, method, headers: {'Content-Type': 'application/json'}})
      .then(response => response.json())
      .then(response => {
        dispatch(apiSuccess(response, feature, action.data));
      })
      .catch(error => {
        return dispatch(apiError(error, feature, action.data));
      });
  }
};
