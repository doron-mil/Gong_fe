import * as _ from 'lodash';
import {
  AREA_FEATURE,
  COURSES_FEATURE,
  COURSES_SCHEDULE_FEATURE, GONG_TYPES_FEATURE,
  READ_TO_STORE_DATA,
  setAreas,
  setCourses,
  setCoursesSchedule, setGongTypes
} from '../../actions/action';
import {API_ERROR, API_REQUEST, API_SUCCESS, apiRequest} from '../../actions/api.actions';
import {JsonConverterService} from '../../../Utils/json-converter/json-converter.service';
import {Injectable} from '@angular/core';
import {Area} from '../../../model/area';
import {CourseSchedule} from '../../../model/courseSchedule';
import {Course} from '../../../model/course';
import {GongType} from '../../../model/gongType';

export const BASIC_URL = 'http://localhost:8081/';
export const GONG_TYPES_URL = `${BASIC_URL}data/gongTypes`;
export const AREA_URL = `${BASIC_URL}data/areas`;
export const COURSES_URL = `${BASIC_URL}data/courses`;
export const COURSES_SCHEDULE_URL = `${BASIC_URL}data/coursesSchedule`;

@Injectable()
export class GeneralMiddlewareService {
  constructor(private jsonConverterService: JsonConverterService) {
  }


  generalMiddleware = ({getState, dispatch}) => (next) => (action) => {
    next(action);

    switch (action.type) {
      case READ_TO_STORE_DATA:
        next(
          apiRequest(null, 'GET', GONG_TYPES_URL, GONG_TYPES_FEATURE, null)
        );
        next(
          apiRequest(null, 'GET', AREA_URL, AREA_FEATURE, null)
        );
        next(
          apiRequest(null, 'GET', COURSES_URL, COURSES_FEATURE, null)
        );
        next(
          apiRequest(null, 'GET', COURSES_SCHEDULE_URL, COURSES_SCHEDULE_FEATURE, null)
        );
        break;
      case `${GONG_TYPES_FEATURE} ${API_SUCCESS}`:
        const gongsTypesArray = this.jsonConverterService.convert(action.payload.data, GongType);
        next(
          setGongTypes(gongsTypesArray)
        );
        break;
      case `${AREA_FEATURE} ${API_SUCCESS}`:
        const areasArray = this.jsonConverterService.convert(action.payload.data, Area);
        next(
          setAreas(areasArray)
        );
        break;
      case `${COURSES_FEATURE} ${API_SUCCESS}`:
        const coursesArray = this.jsonConverterService.convert(action.payload.data, Course);
        next(
          setCourses(coursesArray)
        );
        break;
      case `${COURSES_SCHEDULE_FEATURE} ${API_SUCCESS}`:
        const courseScheduleArray = this.jsonConverterService.convert(action.payload.data, CourseSchedule);
        next(
          setCoursesSchedule(courseScheduleArray)
        );
        break;
    }

    if (action.type.includes(API_ERROR)) {
      console.error('Error in  processing API middleware : ', action);
    }
  };
}
