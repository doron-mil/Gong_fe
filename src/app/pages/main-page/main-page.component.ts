import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {StoreService} from '../../services/store.service';
import {AuthService} from '../../services/auth.service';

import staticEnJsonImport from '../../../assets/i18n/en.json';
import staticHeJsonImport from '../../../assets/i18n/he.json';
import {NotificationTypesEnum} from '../../json-editor/model/data.model';


@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  languagesMap: Map<string, any>;

  constructor(private authService: AuthService,
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
      this.storeService.readToStore();
    }
  }

  copyEnToIterator(aSourceStrings: Array<string>, aTargetLang: string): Promise<Array<string>> {
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
