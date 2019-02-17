import * as _ from 'lodash';
import {
  ADD_MANUAL_GONG,
  AREA_FEATURE, BASIC_DATA_FEATURE,
  COURSES_FEATURE,
  COURSES_SCHEDULE_FEATURE, GET_BASIC_DATA, GONG_TYPES_FEATURE, MANUAL_GONG_ADD_FEATURE, MANUAL_GONGS_LIST_FEATURE,
  READ_TO_STORE_DATA,
  setAreas, setBasicServerData,
  setCourses,
  setCoursesSchedule, setGongTypes, setManualGongsList, updateManualGong
} from '../../actions/action';
import {API_ERROR, API_REQUEST, API_SUCCESS, apiRequest} from '../../actions/api.actions';
import {JsonConverterService} from '../../../Utils/json-converter/json-converter.service';
import {Injectable} from '@angular/core';
import {Area} from '../../../model/area';
import {CourseSchedule} from '../../../model/courseSchedule';
import {Course} from '../../../model/course';
import {GongType} from '../../../model/gongType';
import {UpdateStatusEnum} from '../../../model/updateStatusEnum';
import {ScheduledGong} from '../../../model/ScheduledGong';
import {BasicServerData} from '../../../model/basicServerData';

export const BASIC_URL = 'api/';
export const GONG_TYPES_URL = `${BASIC_URL}data/gongTypes`;
export const AREA_URL = `${BASIC_URL}data/areas`;
export const COURSES_URL = `${BASIC_URL}data/courses`;
export const COURSES_SCHEDULE_URL = `${BASIC_URL}data/coursesSchedule`;
export const GET_MANUAL_GONGS_URL = `${BASIC_URL}data/gongs/list`;
export const ADD_MANUAL_GONG_URL = `${BASIC_URL}data/gong/add`;
export const GET_BASIC_DATA_URL = `${BASIC_URL}nextgong`;

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
        next(
          apiRequest(null, 'GET', GET_MANUAL_GONGS_URL, MANUAL_GONGS_LIST_FEATURE, null)
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
      case `${MANUAL_GONGS_LIST_FEATURE} ${API_SUCCESS}`:
        const scheduledGongsArray = this.jsonConverterService.convert(action.payload.data, ScheduledGong);
        next(
          setManualGongsList(scheduledGongsArray)
        );
        break;
      case GET_BASIC_DATA:
        next(
          apiRequest(null, 'GET', GET_BASIC_DATA_URL, BASIC_DATA_FEATURE, null)
        );
        break;
      case `${BASIC_DATA_FEATURE} ${API_SUCCESS}`:
        const basicServerData = this.jsonConverterService.convertOneObject(action.payload.data, BasicServerData);
        next(
          setBasicServerData(basicServerData)
        );
        break;
      case ADD_MANUAL_GONG:
        const manualGongJson = this.jsonConverterService.convertToJson(action.payload);
        const stringedifiedManualGongJson = JSON.stringify(manualGongJson);
        next(
          apiRequest(stringedifiedManualGongJson, 'POST', ADD_MANUAL_GONG_URL, MANUAL_GONG_ADD_FEATURE, action.payload)
        );
        break;
      case `${MANUAL_GONG_ADD_FEATURE} ${API_SUCCESS}`:
        (action.data as ScheduledGong).updateStatus =
          action.payload.data === 'SUCCESS' ? UpdateStatusEnum.SUCCESS : UpdateStatusEnum.FAILED;
        next(
          updateManualGong(action.data)
        );
        break;
      case `${MANUAL_GONG_ADD_FEATURE} ${API_ERROR}`:
        (action.data as ScheduledGong).updateStatus = UpdateStatusEnum.FAILED;
        next(
          updateManualGong(action.data)
        );
        break;

    }

    if (action.type.includes(API_ERROR)) {
      console.error('Error in  processing API middleware : ', action);
    }
  };
}
