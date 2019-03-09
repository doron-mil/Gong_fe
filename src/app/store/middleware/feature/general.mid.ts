import * as moment from 'moment';
import {
  ADD_MANUAL_GONG,
  AREA_FEATURE,
  BASIC_DATA_FEATURE,
  COURSES_FEATURE,
  COURSES_SCHEDULE_FEATURE,
  GET_BASIC_DATA, getBasicData,
  GONG_TYPES_FEATURE,
  MANUAL_GONG_ADD_FEATURE,
  MANUAL_GONGS_LIST_FEATURE,
  READ_TO_STORE_DATA,
  SCHEDULE_COURSE_ADD,
  SCHEDULE_COURSE_FEATURE,
  SCHEDULED_COURSE_REMOVE,
  SCHEDULED_COURSE_REMOVE_FEATURE,
  TOGGLE_SCHEDULED_GONG,
  TOGGLE_SCHEDULED_GONG_FEATURE,
  setAreas,
  setBasicServerData,
  setCourses,
  setCoursesSchedule,
  setGongTypes,
  setManualGongsList,
  updateCourseSchedule,
  updateManualGong, REMOVE_MANUAL_GONG, REMOVE_MANUAL_GONG_FEATURE
} from '../../actions/action';
import {API_ERROR, API_SUCCESS, apiRequest} from '../../actions/api.actions';
import {JsonConverterService} from '../../../Utils/json-converter/json-converter.service';
import {Injectable} from '@angular/core';
import {Area} from '../../../model/area';
import {CourseSchedule} from '../../../model/courseSchedule';
import {Course} from '../../../model/course';
import {GongType} from '../../../model/gongType';
import {UpdateStatusEnum} from '../../../model/updateStatusEnum';
import {ScheduledGong} from '../../../model/ScheduledGong';
import {BasicServerData} from '../../../model/basicServerData';
import {ScheduledCourseGong} from '../../../model/ScheduledCourseGong';
import {MessagesService} from '../../../services/messages.service';

export const BASIC_URL = 'api/';
export const GONG_TYPES_URL = `${BASIC_URL}data/gongTypes`;
export const AREA_URL = `${BASIC_URL}data/areas`;
export const COURSES_URL = `${BASIC_URL}data/courses`;
export const COURSES_SCHEDULE_URL = `${BASIC_URL}data/coursesSchedule`;
export const ADD_COURSE_SCHEDULE_URL = `${BASIC_URL}data/coursesSchedule/add`;
export const REMOVE_COURSE_SCHEDULE_URL = `${BASIC_URL}data/coursesSchedule/remove`;
export const GET_MANUAL_GONGS_URL = `${BASIC_URL}data/gongs/list`;
export const ADD_MANUAL_GONG_URL = `${BASIC_URL}data/gong/add`;
export const TOGGLE_SCHEDULED_GONG_URL = `${BASIC_URL}data/gong/toggle`;
export const REMOVE_SCHEDULED_GONG_URL = `${BASIC_URL}data/gong/remove`;
export const GET_BASIC_DATA_URL = `${BASIC_URL}nextgong`;

@Injectable()
export class GeneralMiddlewareService {
  constructor(private jsonConverterService: JsonConverterService,
              private messagesService: MessagesService) {
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
      case SCHEDULE_COURSE_ADD:
        const courseSchedule = this.jsonConverterService.convertToJson(action.payload);
        const stringedifiedCourseScheduleJson = JSON.stringify(courseSchedule);
        next(
          apiRequest(stringedifiedCourseScheduleJson, 'POST', ADD_COURSE_SCHEDULE_URL, SCHEDULE_COURSE_FEATURE, action.payload)
        );
        break;
      case `${SCHEDULE_COURSE_FEATURE} ${API_SUCCESS}`:
        const oldCourseSchedule = action.data as CourseSchedule;
        const addedCourseSchedule = this.jsonConverterService.convertOneObject(action.payload.data, CourseSchedule);
        addedCourseSchedule.tmpId = oldCourseSchedule.tmpId;
        addedCourseSchedule.updateStatus = UpdateStatusEnum.SUCCESS;
        next(
          updateCourseSchedule(addedCourseSchedule)
        );
        break;
      case `${SCHEDULE_COURSE_FEATURE} ${API_ERROR}`:
        const newCourseSchedule = (action.data as CourseSchedule).clone();
        newCourseSchedule.updateStatus = UpdateStatusEnum.FAILED;
        next(
          updateCourseSchedule(newCourseSchedule)
        );
        break;
      case SCHEDULED_COURSE_REMOVE:
        const courseScheduleForRemoval = this.jsonConverterService.convertToJson(action.payload);
        const stringedifiedCourseScheduleForRemovalJson = JSON.stringify(courseScheduleForRemoval);
        next(
          apiRequest(stringedifiedCourseScheduleForRemovalJson, 'DELETE', REMOVE_COURSE_SCHEDULE_URL,
            SCHEDULED_COURSE_REMOVE_FEATURE, action.payload)
        );
        break;
      case TOGGLE_SCHEDULED_GONG:
        const scheduledCourseGongJson = this.jsonConverterService.convertToJson(action.payload);
        const stringedifiedScheduledCourseGongJsonJson = JSON.stringify(scheduledCourseGongJson);
        next(
          apiRequest(stringedifiedScheduledCourseGongJsonJson, 'POST', TOGGLE_SCHEDULED_GONG_URL,
            TOGGLE_SCHEDULED_GONG_FEATURE, action.payload)
        );
        break;
      case `${TOGGLE_SCHEDULED_GONG_FEATURE} ${API_SUCCESS}`:
        const aToggledScheduledCourseGong = action.data as ScheduledCourseGong;
        next(
          apiRequest(null, 'GET', COURSES_SCHEDULE_URL, COURSES_SCHEDULE_FEATURE, null)
        );
        const currentState = getState();
        const foundCourseSchedule = currentState.dynamic_data.coursesSchedule.find(
          (tCourseSchedule: CourseSchedule) => tCourseSchedule.id === aToggledScheduledCourseGong.courseId);
        if (foundCourseSchedule) {
          const computedMomentOfGong = moment(foundCourseSchedule.date);
          computedMomentOfGong.add(aToggledScheduledCourseGong.dayNumber, 'd');
          computedMomentOfGong.add(aToggledScheduledCourseGong.time, 'ms');
          if (computedMomentOfGong.isSame(currentState.dynamic_data.basicServerData.nextScheduledJobTime)) {
            dispatch(getBasicData());
          }
        } else {
          console.error(`GeneralMiddlewareService:${TOGGLE_SCHEDULED_GONG_FEATURE} ${API_SUCCESS}` + '' +
            'Error in  processing API middleware : ', action);

        }
        break;
      case REMOVE_MANUAL_GONG:
        const toBRemovedScheduledGongJson = this.jsonConverterService.convertToJson(action.payload);
        const stringedified2BRemovedScheduledGongJson = JSON.stringify(toBRemovedScheduledGongJson);
        next(
          apiRequest(stringedified2BRemovedScheduledGongJson, 'POST', REMOVE_SCHEDULED_GONG_URL,
            REMOVE_MANUAL_GONG_FEATURE, action.payload)
        );
        break;
      case `${REMOVE_MANUAL_GONG_FEATURE} ${API_ERROR}`:
        this.messagesService.cannotDeleteRecord(action.data)
        dispatch(
          apiRequest(null, 'GET', GET_MANUAL_GONGS_URL, MANUAL_GONGS_LIST_FEATURE, null)
        );
        break;
    }

    if (action.type.includes(API_ERROR)) {
      console.error('Error in  processing API middleware : ', action);
    }
  };
}
