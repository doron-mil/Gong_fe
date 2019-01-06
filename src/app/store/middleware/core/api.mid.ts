import {API_REQUEST, apiError, apiSuccess} from '../../actions/api.actions';

export const apiMiddleware = ({dispatch}) => (next) => (action) => {
  next(action);

  if (action.type.includes(API_REQUEST)) {
    const {body, url, method, feature} = action.meta;

    fetch(url, {body, method})
      .then(response => response.json())
      .then(response => {
        const apiSuccess1 = apiSuccess(response, feature, action.data);
        dispatch(apiSuccess1);
      })
      .catch(error => {
        return dispatch(apiError(error, feature, action.data));
      });
  }
};
