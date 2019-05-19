import {BrowserModule, DomSanitizer} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ServiceWorkerModule} from '@angular/service-worker';

import {JwtModule} from '@auth0/angular-jwt';
import {AppComponent} from './app.component';
import {environment} from '../environments/environment';
import {DevToolsExtension, NgRedux, NgReduxModule} from '@angular-redux/store';
import {GeneralMiddlewareService} from './store/middleware/feature/general.mid';
import {ApiMiddlewareService} from './store/middleware/core/api.mid';
import {applyMiddleware, combineReducers, createStore, Store} from 'redux';
import {StoreDataTypeEnum} from './store/storeDataTypeEnum';
import {generalReducer} from './store/reducers/general.reducer';
import {composeWithDevTools} from 'redux-devtools-extension';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {RoutingModule} from './routing/routing.module';
import {TestPage1Component} from './pages/test-page1/test-page1.component';
import {TestPage2Component} from './pages/test-page2/test-page2.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ManualActivationComponent} from './pages/manual-activation/manual-activation.component';
import {MaterialModule} from './material/material.module';
import {AutomaticActivationComponent} from './pages/automatic-activation/automatic-activation.component';
import {JsonConverterModule} from './utils/json-converter/json-converter.module';
import {default as jsonConvConfigUtil} from './utils/json-converter-config/jsonConvConfigUtil';
import {SelectedAreasComponent} from './components/selected-areas/selected-areas.component';
import {dynamicDataReducer} from './store/reducers/dynamic.data.reducer';
import {staticDataReducer} from './store/reducers/static.data.reducer';
import {GongsTimeTableComponent} from './components/gongs-time-table/gongs-time-table.component';
import {LoginComponent} from './pages/login/login.component';
import {MainPageComponent} from './pages/main-page/main-page.component';
import {MomentModule} from 'ngx-moment';
import {ScheduleCourseDialogComponent} from './dialogs/schedule-course-dialog/schedule-course-dialog.component';
import {MatIconRegistry} from '@angular/material';
import {MaxDirective, MinDirective} from './shared/min-max.directive';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export const translationRoot = {
  loader: {
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
    deps: [HttpClient]
  }
};

const jsonConverterConfig = {
  configurationFilePath: 'app/utils/json-converter-config/gong-conversion-schema.json',
  conversionFunctionsMapArray: jsonConvConfigUtil.functionsMapArray,
  classesMapArray: jsonConvConfigUtil.classesMapArray
};

@NgModule({
  declarations: [
    AppComponent,
    TestPage1Component,
    TestPage2Component,
    ManualActivationComponent,
    AutomaticActivationComponent,
    SelectedAreasComponent,
    GongsTimeTableComponent,
    LoginComponent,
    MainPageComponent,
    ScheduleCourseDialogComponent,
    MinDirective,
    MaxDirective,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
    NgReduxModule,
    HttpClientModule,
    TranslateModule.forRoot(translationRoot),
    RoutingModule,
    MomentModule,
    JsonConverterModule.forRoot(jsonConverterConfig),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ['api'],
        blacklistedRoutes: ['api/login', 'api/nextgong']
      }
    }),
  ],
  entryComponents: [ScheduleCourseDialogComponent],
  providers: [ApiMiddlewareService, GeneralMiddlewareService],
  bootstrap: [AppComponent]
})

export class AppModule {

  constructor(private ngRedux: NgRedux<any>,
              private devTools: DevToolsExtension,
              generalMiddlewareService: GeneralMiddlewareService,
              apiMiddlewareService: ApiMiddlewareService,
              matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {

    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/mdi.svg'));

    // ***********************************************
    // ************* Redux Init **********************
    // ***********************************************

    // ************* Middleware **********************
    // ***********************************************
    const featureMiddleware = [
      generalMiddlewareService.generalMiddleware,
    ];

    const coreMiddleware = [
      apiMiddlewareService.apiMiddleware,
    ];

    // ************* Reducers   **********************
    // ***********************************************
    const rootReducer = combineReducers({
      [StoreDataTypeEnum.GENERAL]: generalReducer,
      [StoreDataTypeEnum.STATIC_DATA]: staticDataReducer,
      [StoreDataTypeEnum.DYNAMIC_DATA]: dynamicDataReducer,
    });

    // ************* Store Creation ******************
    // ***********************************************
    const store: Store = createStore(
      rootReducer,
      composeWithDevTools(
        applyMiddleware(...featureMiddleware, ...coreMiddleware)
      )
    );

    ngRedux.provideStore(store);
  }
}
