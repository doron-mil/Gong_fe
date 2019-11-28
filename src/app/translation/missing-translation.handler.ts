import {MissingTranslationHandler, MissingTranslationHandlerParams} from '@ngx-translate/core';
import {NgRedux} from '@angular-redux/store';
import * as _ from 'lodash';

import {StoreDataTypeEnum} from '../store/storeDataTypeEnum';

export function CustomMissingTranslationHandlerFactory(authService: NgRedux<any>) {
  return new CustomMissingTranslationHandler(authService);
}

export class CustomMissingTranslationHandler implements MissingTranslationHandler {
  constructor(private authService: NgRedux<any>) {  }

  handle(params: MissingTranslationHandlerParams) {
    console.error( `Couldn't find translation for ${params.key}`)
    const lastDotIndex = params.key.lastIndexOf('.');
    const isLoggedIn = _.get(this.authService.getState(), [StoreDataTypeEnum.INNER_DATA, 'isLoggedIn']) as boolean;
    const postfix = isLoggedIn ? '˚˚®' : ''; // Alt + k
    const retValue = params.key.substring(lastDotIndex + 1) + postfix;
    return retValue;
  }
}

