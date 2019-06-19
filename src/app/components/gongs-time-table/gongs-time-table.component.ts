import {
  AfterViewChecked,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import {MatCheckbox, MatTableDataSource} from '@angular/material';
import {Observable, Subscription, timer} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import Swal, {SweetAlertResult} from 'sweetalert2';
import * as moment from 'moment';

import {ScheduledGong} from '../../model/ScheduledGong';
import {StoreService} from '../../services/store.service';
import {DateFormat} from '../../model/dateFormat';

enum Translation_Enum {
  CONFIRM_DEGONG_TITLE_DISABLE,
  CONFIRM_DEGONG_TITLE_DELETE,
  CONFIRM_DEGONG_TEXT,
  CONFIRM_DEGONG_CANCEL,
  CONFIRM_DEGONG_CONFIRM_DISABLE,
  CONFIRM_DEGONG_CONFIRM_DELETE,
}

@Component({
  selector: 'app-gongs-time-table',
  templateUrl: './gongs-time-table.component.html',
  styleUrls: ['./gongs-time-table.component.css']
})
export class GongsTimeTableComponent implements OnInit, OnChanges, OnDestroy, OnChanges, AfterViewChecked {

  private _scheduledGongsArray: ScheduledGong[];
  private _displayDate: boolean = true;

  @Input()
  displayDay: boolean = true;

  @Input()
  isDeleteButton: boolean = false;

  @Input()
  isFindNext: boolean = false;

  @Input('displayDate')
  set displayDate(aNewValue: boolean) {
    this._displayDate = aNewValue;
  }

  get displayDate(): boolean {
    return this._displayDate;
  }

  @Input('scheduledGongs')
  set scheduledGongsArray(aNewValue: ScheduledGong[]) {
    this._scheduledGongsArray = aNewValue;
  }

  @Input('computeNextGong')
  private computeNextGong: boolean = false;

  @Output() gongActiveToggleEvent = new EventEmitter<ScheduledGong>();

  @Output() gongsTableDataChangedEvent = new EventEmitter<void>();

  @Output() onScheduledGongEnded = new EventEmitter<boolean>();

  @ViewChildren('cmd') customComponentChildren: QueryList<MatCheckbox>;

  translationMap = new Map<Translation_Enum, string>();

  displayedColumnsOptions = ['day', 'date', 'time', 'gongType', 'area', 'volume', 'isOn'];
  displayedColumns = [];
  dataSource: MatTableDataSource<ScheduledGong>;

  gongTypesSubscription: Subscription;
  nextGongSubscription: Subscription;

  dataSourceWasChanged: boolean;

  dateFormat: DateFormat;

  constructor(private storeService: StoreService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.translateNeededText();

    this.resetDisplayedColumnse();

    this.translate.onLangChange.subscribe(() => this.translateNeededText());

    this.storeService.getDateFormat().subscribe(dateFormat => this.dateFormat = dateFormat.convertToDateFormatter());
  }

  private resetDisplayedColumnse() {
    this.displayedColumns = this.displayedColumnsOptions.filter((colItemName: string) => {
      const isFieldNoDisplay = (!this.displayDay && colItemName === 'day') || (!this._displayDate && colItemName === 'date');
      return !isFieldNoDisplay;
    });
  }

  private translateNeededText() {
    const transKeysConfirmDeGongMap = new Map<string, Translation_Enum>();

    const transKeyBase = 'gongsTimeTable.confirmations.disableDeleteGong.';
    transKeysConfirmDeGongMap.set(transKeyBase + 'title.disable', Translation_Enum.CONFIRM_DEGONG_TITLE_DISABLE);
    transKeysConfirmDeGongMap.set(transKeyBase + 'title.delete', Translation_Enum.CONFIRM_DEGONG_TITLE_DELETE);
    transKeysConfirmDeGongMap.set(transKeyBase + 'text', Translation_Enum.CONFIRM_DEGONG_TEXT);
    transKeysConfirmDeGongMap.set(transKeyBase + 'buttons.cancel', Translation_Enum.CONFIRM_DEGONG_CANCEL);
    transKeysConfirmDeGongMap.set(
      transKeyBase + 'buttons.confirm.disable', Translation_Enum.CONFIRM_DEGONG_CONFIRM_DISABLE);
    transKeysConfirmDeGongMap.set(transKeyBase + 'buttons.confirm.delete', Translation_Enum.CONFIRM_DEGONG_CONFIRM_DELETE);

    this.translate.get(Array.from(transKeysConfirmDeGongMap.keys())).subscribe(transResult => {
      transKeysConfirmDeGongMap.forEach(((value, key) =>
        this.translationMap.set(transKeysConfirmDeGongMap.get(key), transResult[key])));
    });
  }

  private gongActivationToggle(aId: number, aIsOnAction: boolean, aChkBxCtrl: MatCheckbox) {
    const foundScheduledGong =
      this._scheduledGongsArray.find((scheduledGong: ScheduledGong) => scheduledGong.exactMoment.isSame(aId));
    if (foundScheduledGong) {
      aChkBxCtrl.disabled = true; // This will be refreshed when updating the data from the server
      const clonedObj = foundScheduledGong.clone();
      clonedObj.isActive = aIsOnAction;
      this.gongActiveToggleEvent.emit(clonedObj);
    }
  }

  async gongToggle(aEvent, aId) {
    const foundItem = this.customComponentChildren.find((item: MatCheckbox) => +item.id === aId);

    if (foundItem) {
      if (foundItem.checked) {
        aEvent.preventDefault();
        const isDisablingConfirmed = await this.confirmGongDisablingOrDeletion(false);
        if (isDisablingConfirmed) {
          foundItem.checked = false;
          this.gongActivationToggle(aId, false, foundItem);
        }
      } else {
        this.gongActivationToggle(aId, true, foundItem);
      }
    }

    return true;
  }

  gongRemove(aScheduledGongId: number) {
    const foundScheduledGong =
      this._scheduledGongsArray.find(
        (scheduledGong: ScheduledGong) => scheduledGong.exactMoment.isSame(aScheduledGongId));
    if (foundScheduledGong) {
      const clonedObj = foundScheduledGong.clone();
      clonedObj.isActive = false;
      this.gongActiveToggleEvent.emit(clonedObj);
    }
  }

  private async confirmGongDisablingOrDeletion(aIsDelete: boolean = false): Promise<boolean> {
    const title = this.translationMap.get(
      aIsDelete ? Translation_Enum.CONFIRM_DEGONG_TITLE_DELETE : Translation_Enum.CONFIRM_DEGONG_TITLE_DISABLE);

    const confirm = this.translationMap.get(
      aIsDelete ? Translation_Enum.CONFIRM_DEGONG_CONFIRM_DELETE : Translation_Enum.CONFIRM_DEGONG_CONFIRM_DISABLE);


    const result: SweetAlertResult = await Swal.fire({
      title,
      text: this.translationMap.get(Translation_Enum.CONFIRM_DEGONG_TEXT),
      imageUrl: '/assets/icons/alerts/icons8-error-48.png',
      customClass: 'confirmClass',
      confirmButtonText: confirm,
      showCancelButton: true,
      cancelButtonText: this.translationMap.get(Translation_Enum.CONFIRM_DEGONG_CANCEL),
    });

    return Promise.resolve(result.value === true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.displayDate) {
      this.resetDisplayedColumnse();
    } else if (changes.scheduledGongsArray) {
      this.createDataSource();
    }
  }

  ngAfterViewChecked() {
    if (this.dataSourceWasChanged) {
      this.gongsTableDataChangedEvent.emit();
      this.dataSourceWasChanged = false;
    }
  }

  private createDataSource() {
    this.cancelSubscription();

    if (this._scheduledGongsArray && this._scheduledGongsArray.length > 0) {
      let nextGongIndex = -1;

      this.gongTypesSubscription = this.storeService.getGongTypesMap().subscribe(gongTypesMap => {
        let lastScheduledGongReord: ScheduledGong = new ScheduledGong();
        const currentMoment = moment();
        this._scheduledGongsArray.forEach((scheduledGong: ScheduledGong, index) => {
          scheduledGong.gongTypeName = gongTypesMap[scheduledGong.gongTypeId].name;

          if (scheduledGong.dayNumber !== lastScheduledGongReord.dayNumber) {
            lastScheduledGongReord = scheduledGong;
            lastScheduledGongReord.span = 1;
          } else {
            scheduledGong.span = 0;
            lastScheduledGongReord.span++;
          }

          if (nextGongIndex < 0 && this.isFindNext) {
            scheduledGong.isAfterNextGong = scheduledGong.exactMoment.isSameOrAfter(currentMoment);
            if (scheduledGong.isAfterNextGong) {
              scheduledGong.isTheNextGong = true;
              nextGongIndex = index;
            } else {
              scheduledGong.isTheNextGong = false;
            }
          } else {
            scheduledGong.isAfterNextGong = true;
            scheduledGong.isTheNextGong = false;
          }
        });
        this.dataSource = new MatTableDataSource<ScheduledGong>(this._scheduledGongsArray);
        this.dataSourceWasChanged = true;

      });

      this.timerToChangeNextGong(nextGongIndex);
    }
  }

  private timerToChangeNextGong(aNextGongIndex: number) {
    if (aNextGongIndex < 0) {
      return;
    }
    if (aNextGongIndex >= this._scheduledGongsArray.length) {
      this.onScheduledGongEnded.emit(true);
      return;
    }
    const timeOfNextGong = this._scheduledGongsArray[aNextGongIndex].exactMoment.add(1, 'm');
    this.nextGongSubscription = timer(timeOfNextGong.toDate()).subscribe(() => {
      this.onScheduledGongEnded.emit(false);
      this._scheduledGongsArray[aNextGongIndex].isTheNextGong = false;
      this._scheduledGongsArray[aNextGongIndex].isAfterNextGong = false;
      this._scheduledGongsArray[aNextGongIndex + 1].isTheNextGong = true;
      this.timerToChangeNextGong(aNextGongIndex + 1);
    });
  }

  cancelSubscription() {
    if (this.gongTypesSubscription) {
      this.gongTypesSubscription.unsubscribe();
    }
    if (this.nextGongSubscription) {
      this.nextGongSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.cancelSubscription();
  }

}
