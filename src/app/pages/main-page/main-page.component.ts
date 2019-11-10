import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {StoreService} from '../../services/store.service';
import {AuthService} from '../../services/auth.service';

import staticEnJsonImport from '../../../assets/i18n/en.json';
import staticHeJsonImport from '../../../assets/i18n/he.json';
import {NotificationTypesEnum} from '../../json-editor/model/data.model';
import {HttpClient, HttpParams} from '@angular/common/http';

interface TransResponseInt {
  data: { translations: Array<{ translatedText: string }> };
}

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  languagesMap: Map<string, any>;

  loggedInRole: string;

  apiKey = '';
  url = 'https://translation.googleapis.com/language/translate/v2/';

  constructor(private authService: AuthService,
              private http: HttpClient,
              private router: Router,
              private storeService: StoreService) {
    this.languagesMap = new Map<string, any>();
    this.languagesMap.set('en', staticEnJsonImport);
    this.languagesMap.set('he', staticHeJsonImport);
  }

  ngOnInit() {
    if (!this.authService.loggedIn) {
      this.router.navigate(['loginPage']);
    } else {
      this.loggedInRole = this.authService.getRole();
      this.storeService.readToStore();
    }
  }

  getTranslateMethod() {
    return this.googleTranslateMethod.bind(this);
  }

  googleTranslateMethod(aSourceStrings: Array<string>, aTargetLang: string): Promise<Array<string>> {
    // let params = new HttpParams();
    // aSourceStrings.forEach(sourceString => params = params.append('q', sourceString));
    // params = params.append('source', 'en');
    // params = params.append('target', aTargetLang);
    // params = params.append('key', this.apiKey);
    //
    // return new Promise((resolve, reject) => {
    //   this.http.get(this.url, {params: params})
    //     .subscribe((response: TransResponseInt) => {
    //       const transArray = response.data.translations.map(trans => trans.translatedText);
    //       resolve(transArray);
    //     });
    // });

    const retValue = aSourceStrings.map(sourceString => sourceString + '_' + aTargetLang);
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(retValue), 50);
    });
  }

  languagesMapUpdateReceived(aReceivedLangMap: Map<string, any>) {
    console.log('languagesMapUpdateReceived ', aReceivedLangMap);
  }

  jsonEditorMessageReceived(aMessagesEnum: NotificationTypesEnum) {
    console.log(`jsonEditorMessageReceived was activated with value ${aMessagesEnum}`);
  }
}
