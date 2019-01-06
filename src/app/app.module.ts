import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ServiceWorkerModule} from '@angular/service-worker';

import {AppComponent} from './app.component';
import {environment} from '../environments/environment';
import {DevToolsExtension, NgRedux, NgReduxModule} from '@angular-redux/store';
import {generalMiddleware} from './store/middleware/feature/general.mid';
import {apiMiddleware} from './store/middleware/core/api.mid';
import {applyMiddleware, combineReducers, createStore, Store} from 'redux';
import {StoreDataTypeEnum} from './store/storeDataTypeEnum';
import {generalReducer} from './store/reducers/general.reducer';
import {composeWithDevTools} from 'redux-devtools-extension';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {RoutingModule} from './routing/routing.module';
import { TestPage1Component } from './pages/test-page1/test-page1.component';
import { TestPage2Component } from './pages/test-page2/test-page2.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ManualActivationComponent } from './pages/manual-activation/manual-activation.component';
import {MaterialModule} from './material/material.module';
import { AutomaticActivationComponent } from './pages/automatic-activation/automatic-activation.component';

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

@NgModule({
  declarations: [
    AppComponent,
    TestPage1Component,
    TestPage2Component,
    ManualActivationComponent,
    AutomaticActivationComponent
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {

  constructor(private ngRedux: NgRedux<any>,
              private devTools: DevToolsExtension,
              translate: TranslateService) {

    // ************* Translator Init *****************
    // ***********************************************
    translate.setDefaultLang('he');
    translate.use('he');

    // ***********************************************
    // ************* Redux Init **********************
    // ***********************************************

    // ************* Middleware **********************
    // ***********************************************
    const featureMiddleware = [
      generalMiddleware,
    ];

    const coreMiddleware = [
      apiMiddleware,
    ];

    // ************* Reducers   **********************
    // ***********************************************
    const rootReducer = combineReducers({
      [StoreDataTypeEnum.GENERAL]: generalReducer,
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
