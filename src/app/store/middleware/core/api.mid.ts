import {API_REQUEST, apiError, apiSuccess} from '../../actions/api.actions';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

let headers: any = new HttpHeaders()
  .set('Content-Type', 'application/json');

@Injectable()
export class ApiMiddlewareService {


  constructor(private http: HttpClient) {
  }

  apiMiddleware = ({dispatch}) => (next) => (action) => {
    next(action);

    if (action.type.includes(API_REQUEST)) {
      const {body, url, method, feature} = action.meta;

      if (body instanceof FormData) {
        headers = {};
      }
      this.http.request(method, url, {body, headers}).subscribe(
        (response: Response) => {
          dispatch(apiSuccess(response, feature, action.data));
        },
        error => {
          dispatch(apiError(error, feature, action.data));
        },
        () => {
          // console.log(`The ${method} observable is now completed.`);
        }
      );
    }
  };
}
