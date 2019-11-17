import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import moment from 'moment';

import {AngularJsonClassConverterService} from 'angular-json-class-converter';
import {API_ERROR, API_SUCCESS, apiRequest} from '../../actions/api.actions';

import {ActionFeaturesEnum, ActionGenerator, ActionTypesEnum} from '../../actions/action';
import {Area} from '../../../model/area';
import {CourseSchedule} from '../../../model/courseSchedule';
import {Course} from '../../../model/course';
import {GongType} from '../../../model/gongType';
import {UpdateStatusEnum} from '../../../model/updateStatusEnum';
import {ScheduledGong} from '../../../model/ScheduledGong';
import {BasicServerData} from '../../../model/basicServerData';
import {ScheduledCourseGong} from '../../../model/ScheduledCourseGong';
import {MessagesService} from '../../../services/messages.service';
import {DateFormat} from '../../../model/dateFormat';
import {AuthService} from '../../../services/auth.service';


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
export const PLAY_GONG_URL = `${BASIC_URL}relay/playGong`;

@Injectable()
export class GeneralMiddlewareService {
  constructor(private jsonConverterService: AngularJsonClassConverterService,
              private authService: AuthService,
              private router: Router,
              private messagesService: MessagesService) {
  }


  generalMiddleware = ({getState, dispatch}) => (next) => (action) => {
    next(action);

    switch (action.type) {
      case ActionTypesEnum.READ_TO_STORE_DATA:
        next(
          apiRequest(null, 'GET', GONG_TYPES_URL, ActionFeaturesEnum.GONG_TYPES_FEATURE, null)
        );
        next(
          apiRequest(null, 'GET', AREA_URL, ActionFeaturesEnum.AREA_FEATURE, null)
        );
        next(
          apiRequest(null, 'GET', COURSES_URL, ActionFeaturesEnum.COURSES_FEATURE, null)
        );
        next(
          apiRequest(null, 'GET', COURSES_SCHEDULE_URL, ActionFeaturesEnum.COURSES_SCHEDULE_FEATURE, null)
        );
        next(
          apiRequest(null, 'GET', GET_MANUAL_GONGS_URL, ActionFeaturesEnum.MANUAL_GONGS_LIST_FEATURE, null)
        );
        break;
      case `${ActionFeaturesEnum.GONG_TYPES_FEATURE} ${API_SUCCESS}`:
        const gongsTypesArray = this.jsonConverterService.convert<GongType>(action.payload.data, 'GongType');
        next(
          ActionGenerator.setGongTypes(gongsTypesArray)
        );
        break;
      case `${ActionFeaturesEnum.AREA_FEATURE} ${API_SUCCESS}`:
        const areasArray = this.jsonConverterService.convert<Area>(action.payload.data, 'Area');
        next(
          ActionGenerator.setAreas(areasArray)
        );
        break;
      case `${ActionFeaturesEnum.COURSES_FEATURE} ${API_SUCCESS}`:
        const coursesArray = this.jsonConverterService.convert<Course>(action.payload.data, 'Course');
        next(
          ActionGenerator.setCourses(coursesArray)
        );
        break;
      case `${ActionFeaturesEnum.COURSES_SCHEDULE_FEATURE} ${API_SUCCESS}`:
        const courseScheduleArray = this.jsonConverterService.convert<CourseSchedule>(
          action.payload.data, 'CourseSchedule');
        next(
          ActionGenerator.setCoursesSchedule(courseScheduleArray)
        );
        break;
      case `${ActionFeaturesEnum.MANUAL_GONGS_LIST_FEATURE} ${API_SUCCESS}`:
        const scheduledGongsArray = this.jsonConverterService.convert<ScheduledGong>(
          action.payload.data, 'ScheduledGong');
        next(
          ActionGenerator.setManualGongsList(scheduledGongsArray)
        );
        break;
      case ActionTypesEnum.GET_BASIC_DATA:
        next(
          apiRequest(null, 'GET', GET_BASIC_DATA_URL, ActionFeaturesEnum.BASIC_DATA_FEATURE, null)
        );
        const localStorageDateFormatStrigified = localStorage.getItem('date_format');
        if (localStorageDateFormatStrigified) {
          const localStorageDateFormatParsed = JSON.parse(localStorageDateFormatStrigified);
          const localStorageDateFormat =
            this.jsonConverterService.convertOneObject<DateFormat>(localStorageDateFormatParsed, 'DateFormat');
          next(
            ActionGenerator.setDateFormat(localStorageDateFormat)
          );
        }
        break;
      case `${ActionFeaturesEnum.BASIC_DATA_FEATURE} ${API_SUCCESS}`:
        const basicServerData = this.jsonConverterService.convertOneObject<BasicServerData>(
          action.payload.data, 'BasicServerData');
        next(
          ActionGenerator.setBasicServerData(basicServerData)
        );
        break;
      case ActionTypesEnum.ADD_MANUAL_GONG:
        const manualGongJson = this.jsonConverterService.convertToJson(action.payload);
        const stringedifiedManualGongJson = JSON.stringify(manualGongJson);
        next(
          apiRequest(stringedifiedManualGongJson, 'POST', ADD_MANUAL_GONG_URL,
            ActionFeaturesEnum.MANUAL_GONG_ADD_FEATURE, action.payload)
        );
        break;
      case `${ActionFeaturesEnum.MANUAL_GONG_ADD_FEATURE} ${API_SUCCESS}`:
        (action.data as ScheduledGong).updateStatus =
          action.payload.data === 'SUCCESS' ? UpdateStatusEnum.SUCCESS : UpdateStatusEnum.FAILED;
        next(
          ActionGenerator.updateManualGong(action.data)
        );
        dispatch(
          apiRequest(null, 'GET', GET_BASIC_DATA_URL, ActionFeaturesEnum.BASIC_DATA_FEATURE, null)
        );
        break;
      case `${ActionFeaturesEnum.MANUAL_GONG_ADD_FEATURE} ${API_ERROR}`:
        (action.data as ScheduledGong).updateStatus = UpdateStatusEnum.FAILED;
        next(
          ActionGenerator.updateManualGong(action.data)
        );
        break;
      case ActionTypesEnum.SCHEDULE_COURSE_ADD:
        const courseSchedule = this.jsonConverterService.convertToJson(action.payload);
        const stringedifiedCourseScheduleJson = JSON.stringify(courseSchedule);
        next(
          apiRequest(stringedifiedCourseScheduleJson, 'POST',
            ADD_COURSE_SCHEDULE_URL, ActionFeaturesEnum.SCHEDULE_COURSE_FEATURE, action.payload)
        );
        break;
      case `${ActionFeaturesEnum.SCHEDULE_COURSE_FEATURE} ${API_SUCCESS}`:
        const oldCourseSchedule = action.data as CourseSchedule;
        const addedCourseSchedule = this.jsonConverterService.convertOneObject<CourseSchedule>(
          action.payload.data, 'CourseSchedule');
        addedCourseSchedule.tmpId = oldCourseSchedule.tmpId;
        addedCourseSchedule.updateStatus = UpdateStatusEnum.SUCCESS;
        next(
          ActionGenerator.updateCourseSchedule(addedCourseSchedule)
        );
        break;
      case `${ActionFeaturesEnum.SCHEDULE_COURSE_FEATURE} ${API_ERROR}`:
        const newCourseSchedule = (action.data as CourseSchedule).clone();
        newCourseSchedule.updateStatus = UpdateStatusEnum.FAILED;
        next(
          ActionGenerator.updateCourseSchedule(newCourseSchedule)
        );
        break;
      case ActionTypesEnum.SCHEDULED_COURSE_REMOVE:
        const courseScheduleForRemoval = this.jsonConverterService.convertToJson(action.payload);
        const stringedifiedCourseScheduleForRemovalJson = JSON.stringify(courseScheduleForRemoval);
        next(
          apiRequest(stringedifiedCourseScheduleForRemovalJson, 'DELETE', REMOVE_COURSE_SCHEDULE_URL,
            ActionFeaturesEnum.SCHEDULED_COURSE_REMOVE_FEATURE, action.payload)
        );
        break;
      case ActionTypesEnum.TOGGLE_SCHEDULED_GONG:
        const scheduledCourseGongJson = this.jsonConverterService.convertToJson(action.payload);
        const stringedifiedScheduledCourseGongJsonJson = JSON.stringify(scheduledCourseGongJson);
        next(
          apiRequest(stringedifiedScheduledCourseGongJsonJson, 'POST', TOGGLE_SCHEDULED_GONG_URL,
            ActionFeaturesEnum.TOGGLE_SCHEDULED_GONG_FEATURE, action.payload)
        );
        break;
      case `${ActionFeaturesEnum.TOGGLE_SCHEDULED_GONG_FEATURE} ${API_SUCCESS}`:
        const aToggledScheduledCourseGong = action.data as ScheduledCourseGong;
        next(
          apiRequest(null, 'GET', COURSES_SCHEDULE_URL, ActionFeaturesEnum.COURSES_SCHEDULE_FEATURE, null)
        );
        const currentState = getState();
        const foundCourseSchedule = currentState.dynamic_data.coursesSchedule.find(
          (tCourseSchedule: CourseSchedule) => tCourseSchedule.id === aToggledScheduledCourseGong.courseId);
        if (foundCourseSchedule) {
          const computedMomentOfGong = moment(foundCourseSchedule.date);
          computedMomentOfGong.add(aToggledScheduledCourseGong.dayNumber, 'd');
          computedMomentOfGong.add(aToggledScheduledCourseGong.time, 'ms');
          if (computedMomentOfGong.isSame(currentState.dynamic_data.basicServerData.nextScheduledJobTime)) {
            dispatch(ActionGenerator.getBasicData());
          }
        } else {
          console.error(`GeneralMiddlewareService:${ActionFeaturesEnum.TOGGLE_SCHEDULED_GONG_FEATURE} ${API_SUCCESS}` + '' +
            'Error in  processing API middleware : ', action);

        }
        break;
      case ActionTypesEnum.REMOVE_MANUAL_GONG:
        const toBRemovedScheduledGongJson = this.jsonConverterService.convertToJson(action.payload);
        const stringedified2BRemovedScheduledGongJson = JSON.stringify(toBRemovedScheduledGongJson);
        next(
          apiRequest(stringedified2BRemovedScheduledGongJson, 'POST', REMOVE_SCHEDULED_GONG_URL,
            ActionFeaturesEnum.REMOVE_MANUAL_GONG_FEATURE, action.payload)
        );
        break;
      case `${ActionFeaturesEnum.REMOVE_MANUAL_GONG_FEATURE} ${API_ERROR}`:
        this.messagesService.cannotDeleteRecord(action.data);
        dispatch(
          apiRequest(null, 'GET', GET_MANUAL_GONGS_URL, ActionFeaturesEnum.MANUAL_GONGS_LIST_FEATURE, null)
        );
        break;
      case ActionTypesEnum.PLAY_GONG:
        next(ActionGenerator.setPlayGongEnabled(false));
        const toBPlayedGongJson = this.jsonConverterService.convertToJson(action.payload);
        const stringedified2PlayedGongJson = JSON.stringify(toBPlayedGongJson);
        next(
          apiRequest(stringedified2PlayedGongJson, 'POST', PLAY_GONG_URL,
            ActionFeaturesEnum.PLAY_GONG_FEATURE, action.payload)
        );
        break;
      case `${ActionFeaturesEnum.PLAY_GONG_FEATURE} ${API_SUCCESS}`:
        next(ActionGenerator.setPlayGongEnabled(true));
        this.messagesService.gongPlayedResult(action.payload.gongSuccessPlay);
        break;
      case ActionTypesEnum.SET_DATE_FORMAT:
        localStorage.setItem('date_format', JSON.stringify(action.payload));
        break;
    }

    if (action.type.includes(API_ERROR)) {

      if (action.payload && action.payload.error && action.payload.error.message &&
        (action.payload.error.message as string).includes('invalid token')) {
        console.error('Logged In expired');
        this.authService.logout();
        this.router.navigate(['loginPage']);
      } else {
        console.error('Error in  processing API middleware : ', action);
      }
    }
  };
}
