import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

import * as _ from 'lodash';
import moment from 'moment';

import {AngularJsonClassConverterService} from 'angular-json-class-converter';
import {API_ERROR, API_SUCCESS, apiMockSuccess, apiRequest, apiSuccess} from '../../actions/api.actions';

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
import {DbObjectTypeEnum, IndexedDbService} from '../../../shared/indexed-db.service';
import {StoreDataTypeEnum} from '../../storeDataTypeEnum';
import {StoreService} from '../../../services/store.service';


const BASIC_URL = 'api/';
const GET_STATIC_DATA_URL = `${BASIC_URL}data/staticData`;
const GONG_TYPES_URL = `${BASIC_URL}data/gongTypes`;
const AREA_URL = `${BASIC_URL}data/areas`;
const COURSES_URL = `${BASIC_URL}data/courses`;
const COURSES_SCHEDULE_URL = `${BASIC_URL}data/coursesSchedule`;
const ADD_COURSE_SCHEDULE_URL = `${BASIC_URL}data/coursesSchedule/add`;
const REMOVE_COURSE_SCHEDULE_URL = `${BASIC_URL}data/coursesSchedule/remove`;
const GET_MANUAL_GONGS_URL = `${BASIC_URL}data/gongs/list`;
const ADD_MANUAL_GONG_URL = `${BASIC_URL}data/gong/add`;
const TOGGLE_SCHEDULED_GONG_URL = `${BASIC_URL}data/gong/toggle`;
const REMOVE_SCHEDULED_GONG_URL = `${BASIC_URL}data/gong/remove`;
const GET_BASIC_DATA_URL = `${BASIC_URL}nextgong`;
const PLAY_GONG_URL = `${BASIC_URL}relay/playGong`;
const UPLOAD_COURSES_URL = `${BASIC_URL}data/uploadCourses`;

@Injectable()
export class GeneralMiddlewareService {
  constructor(private jsonConverterService: AngularJsonClassConverterService,
              private authService: AuthService,
              private storeService: StoreService,
              private router: Router,
              private indexedDbService: IndexedDbService,
              private messagesService: MessagesService) {
  }


  generalMiddleware = ({getState, dispatch}) => (next) => (action) => {
    next(action);

    switch (action.type) {
      case ActionTypesEnum.READ_TO_STORE_DATA:
        // Checking to see if static data refresh is needed
        this.storeService.getBasicServerDataPromise().then((pBasicServerData) => {
          const staticUpdateTime = Number(localStorage.getItem('static_update_time'));
          const serverStaticDataLastUpdateTime = pBasicServerData.staticDataLastUpdateTime.getTime();
          if (Number.isNaN(staticUpdateTime) || serverStaticDataLastUpdateTime > staticUpdateTime) {
            next(
              apiRequest(null, 'GET', GET_STATIC_DATA_URL, ActionFeaturesEnum.STATIC_DATA_FEATURE, serverStaticDataLastUpdateTime)
            );
          } else {
            dispatch(ActionGenerator.readToStoreStaticData());
          }
        });

        next(
          apiRequest(null, 'GET', COURSES_SCHEDULE_URL, ActionFeaturesEnum.COURSES_SCHEDULE_FEATURE, null)
        );
        next(
          apiRequest(null, 'GET', GET_MANUAL_GONGS_URL, ActionFeaturesEnum.MANUAL_GONGS_LIST_FEATURE, null)
        );
        next(ActionGenerator.setPlayGongEnabled(true));
        break;
      case ActionTypesEnum.READ_TO_STORE_STATIC_DATA:
        // load data from indexedDB
        let promise;
        let promiseArray: Promise<any>[] = [];

        promise = this.indexedDbService.getAllStoredDataRecords(DbObjectTypeEnum.AREAS).then((pAreasJson) => {
          dispatch(apiMockSuccess(pAreasJson, ActionFeaturesEnum.AREA_FEATURE, null));
        });
        promiseArray.push(promise);

        promise = this.indexedDbService.getAllStoredDataRecords(DbObjectTypeEnum.COURSES).then((pCoursesJson) => {
          dispatch(apiMockSuccess(pCoursesJson, ActionFeaturesEnum.COURSES_FEATURE, null));
        });
        promiseArray.push(promise);

        promise = this.indexedDbService.getAllStoredDataRecords(DbObjectTypeEnum.GONGS).then((pGongTypesJson) => {
          dispatch(apiMockSuccess(pGongTypesJson, ActionFeaturesEnum.GONG_TYPES_FEATURE, null));
        });
        promiseArray.push(promise);

        Promise.all(promiseArray)
          .then(() => next(ActionGenerator.storeStaticDataWasUpdated()))
          .catch(error =>
            console.error(`GeneralMiddlewareService:${ActionTypesEnum.READ_TO_STORE_STATIC_DATA}` + '' +
              'Error in  processing API middleware : ', error));

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
        next(
          ActionGenerator.setCoursesRawData(JSON.stringify(action.payload.data))
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
      case `${ActionFeaturesEnum.STATIC_DATA_FEATURE} ${API_SUCCESS}`:
        localStorage.setItem('static_update_time', action.data);

        promiseArray = [];

        const staticData = _.get(action, ['payload', 'data']);

        const languagesJson = _.get(staticData, 'languages');
        promise = this.indexedDbService.saveDataArray2DB(DbObjectTypeEnum.LANGUAGES, languagesJson
          , (val) => val.translation, (val) => val.language);
        promiseArray.push(promise);

        const areasJson = _.get(staticData, 'areas');
        promise = this.indexedDbService.saveDataArray2DB(DbObjectTypeEnum.AREAS, areasJson);
        promiseArray.push(promise);

        const gongTypesJson = _.get(staticData, 'gongTypes');
        promise = this.indexedDbService.saveDataArray2DB(DbObjectTypeEnum.GONGS, gongTypesJson);
        promiseArray.push(promise);

        const coursesJson = _.get(staticData, 'courses');
        promise = this.indexedDbService.saveDataArray2DB(DbObjectTypeEnum.COURSES, coursesJson, undefined
          , (val) => val.course_name);
        promiseArray.push(promise);

        Promise.all(promiseArray)
          .then(() => dispatch(ActionGenerator.readToStoreStaticData()))
          .catch(error =>
            console.error(`GeneralMiddlewareService:${ActionFeaturesEnum.STATIC_DATA_FEATURE} ${API_SUCCESS}` + '' +
              'Error in  processing API middleware : ', error));

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
      case ActionTypesEnum.UPLOAD_COURSES_FILE:
        const file = action.payload as File;
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);
        next(
          apiRequest(formData, 'POST', UPLOAD_COURSES_URL,
            ActionFeaturesEnum.UPLOAD_COURSES_FILE_FEATURE, action.payload)
        );
        break;
      case `${ActionFeaturesEnum.UPLOAD_COURSES_FILE_FEATURE} ${API_SUCCESS}`:
        next(
          apiRequest(null, 'GET', COURSES_URL, ActionFeaturesEnum.COURSES_FEATURE, null)
        );
      // tslint:disable-next-line:no-switch-case-fall-through
      case `${ActionFeaturesEnum.UPLOAD_COURSES_FILE_FEATURE} ${API_ERROR}`:
        this.messagesService.coursesUploaded(action.payload.error && action.payload.error.additional_message);
        next(
          ActionGenerator.uploadCourseFileHasComplete()
        );
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
