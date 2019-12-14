import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

import {StoreService} from '../../services/store.service';

import {AuthService} from '../../services/auth.service';
import {NotificationTypesEnum} from '../../json-editor/shared/dataModels/lang.model';

interface TransResponseInt {
  data: { translations: Array<{ translatedText: string }> };
}

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  loggedInRole: string;

  apiKey = '';
  url = 'https://translation.googleapis.com/language/translate/v2/';

  constructor(private authService: AuthService,
              private http: HttpClient,
              private router: Router,
              private storeService: StoreService) {
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
    // console.log(`jsonEditorMessageReceived was activated with value ${aMessagesEnum}`);
  }

  isAdmin(): boolean {
    return ['admin', 'dev'].includes(this.authService.getRole());
  }
}
