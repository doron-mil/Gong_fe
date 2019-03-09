import * as _ from 'lodash';
import 'jest';
import 'jest-preset-angular';
import configureStore from 'redux-mock-store';

import {GeneralMiddlewareService} from '../middleware/feature/general.mid';
import {ApiMiddlewareService} from '../middleware/core/api.mid';
import {generalReducer} from '../reducers/general.reducer';
import {JsonConverterService} from '../../Utils/json-converter/json-converter.service';


// Middleware simulator
const mockedMiddlewareCreate = () => {
  const next = jest.fn();
  const store = {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
  };

  const jsonConverterService = new JsonConverterService(null, null);
  const generalMiddlewareService = new GeneralMiddlewareService(jsonConverterService, null);

  const invoke = (action) => generalMiddlewareService.generalMiddleware(store)(next)(action);
  return {store, next, invoke};
};


fdescribe('store.test.spec.jest', () => {

  beforeEach(() => {
  });

  const testSeries003 = '003';
  fdescribe(`#${testSeries003} - REDUCERS TEST WITH MIDDLEWARE - allDataSetAction`, () => {
    const jsonConverterService = new JsonConverterService(null, null);
    const generalMiddlewareService = new GeneralMiddlewareService(jsonConverterService, null);
    const apiMiddlewareService = new ApiMiddlewareService(null);
    const middleWares = [generalMiddlewareService.generalMiddleware, apiMiddlewareService.apiMiddleware];
    const mockStore = configureStore(middleWares);

    const store = mockStore({});

    // Getting

    let actions: Array<any>;

    store.dispatch({});
    actions = store.getActions();

    it(`#${testSeries003}.01 - total actions`, async () => {
      expect(actions.length).toEqual(4);
    });

    it(`#${testSeries003}.02 - reducer`, async () => {

      actions.forEach((action) => {
        expect(generalReducer(undefined, action)).toMatchSnapshot();
      });
    });

  });

  const testSeries002 = '002';
  fdescribe(`#${testSeries002} - MIDDLEWARE - middleware itself using MOCKs`, () => {
    const {store, next, invoke} = mockedMiddlewareCreate();
    const actionToInvoke = {};
    invoke(actionToInvoke);

    fit(`#${testSeries002}.01 - allDataSetAction/ALL_DATA_SET was called in the middleware`, () => {
      expect(next).toHaveBeenCalledWith(actionToInvoke);
    });

    fit(`#${testSeries002}.02 - actions' count to be dispathed`, () => {
      expect(store.dispatch).toHaveBeenCalledTimes(3);
    });

    fit(`#${testSeries002}.03 - verifying INSPECTIONS_DATA_SET dispatched`, () => {
      expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'Action Type...',
        payload: expect.any(Object)
      }));
    });

    // fit(`#${testSeries002}.04 - verifying SQUAD_AIRCRAFT_DATA_SET dispatched`, () => {
    //   expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({
    //     type: SQUAD_AIRCRAFT_DATA_SET,
    //     payload: expect.any(Object)
    //   }));
    // });

    fit(`#${testSeries002}.05 - verifying WORK_ARRAYS_DATA_SET dispatched`, () => {
      expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'Action Type...',
        payload: expect.any(Object)
      }));
    });
  });

  const testSeries001 = '001';
  fdescribe(`#${testSeries001} - ACTION CHECK - checking action creation`, () => {
    const aPayload = {
      id: 1,
      content: 'testContent',
      calculated: 'testCalculated'
    };

    it(`#${testSeries001}.01 - allDataSetAction - ALL_DATA_SET`, () => {
      const expectedAction = {type: 'ALL_DATA_SET', payload: aPayload};
      expect({}).toEqual(expectedAction);
    });
  });
});

