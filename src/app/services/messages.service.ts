import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatSnackBar} from '@angular/material';
import {ScheduledGong} from '../model/ScheduledGong';
import {EnumUtils} from '../utils/enumUtils';
import {sprintf} from 'sprintf-js';

// var old_sprintf = require('sprintf-js');
enum MessagesTranslationEnum {
  CANNOT_DELETE_SCHEDULED_GONG = 'couldNotDeleteScheduledGong',
  CANNOT_SCHEDULE_OBSOLETE_GONG = 'couldNotScheduleObsoleteGong',
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private translationMap = new Map<(string | number), string>();

  constructor(
    private snackBar: MatSnackBar,
    private translate: TranslateService) {

    this.translate.onLangChange.subscribe(() => this.translateNeededText());

  }

  private translateNeededText() {
    this.translationMap.clear();
    const transKeysConfirmDeGongMap = new Map<string, string>();

    const transKeyBase = 'general.messages.';

    const transEnumsArray = EnumUtils.getEnumKeys(MessagesTranslationEnum);
    transEnumsArray.forEach((enumKey) => {
      transKeysConfirmDeGongMap.set(enumKey, transKeyBase + MessagesTranslationEnum[enumKey]);
    });

    this.translate.get(Array.from(transKeysConfirmDeGongMap.values())).subscribe(transResult => {
      transKeysConfirmDeGongMap.forEach((value, key) => {
        this.translationMap.set(MessagesTranslationEnum[key], transResult[value]);
      });
    });
  }

  private getTranlation(aTransKey: (string | number)) {
    const retTrans = this.translationMap.get(aTransKey);
    return retTrans;
  }

  cannotDeleteRecord(aScheduledGong: ScheduledGong) {
    const messageTrans = this.getTranlation(MessagesTranslationEnum.CANNOT_DELETE_SCHEDULED_GONG);
    const messageTransWithParams = sprintf(messageTrans, aScheduledGong.exactMoment.format('YYYY-MM-DD HH:mm'));
    this.snackBar.open(messageTransWithParams, null, {
      duration: 5000,
      panelClass: 'snackBarClass',
    });
  }

  scheduleGongToFutureTime() {
    const messageTrans = this.getTranlation(MessagesTranslationEnum.CANNOT_SCHEDULE_OBSOLETE_GONG);
    this.snackBar.open(messageTrans, null, {
      duration: 5000,
      panelClass: 'snackBarClass',
    });
  }

}
