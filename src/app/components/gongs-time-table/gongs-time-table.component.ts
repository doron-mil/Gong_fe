import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {MatCheckbox, MatListOption, MatTableDataSource} from '@angular/material';
import {NgRedux} from '@angular-redux/store';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import swal from 'sweetalert';
import * as moment from 'moment';

import {ScheduledGong} from '../../model/ScheduledGong';
import {StoreService} from '../../services/store.service';
import {BasicServerData} from '../../model/basicServerData';
import {StoreDataTypeEnum} from '../../store/storeDataTypeEnum';

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
export class GongsTimeTableComponent implements OnInit, OnChanges, OnDestroy {

  private _scheduledGongsArray: ScheduledGong[];

  @Input() displayDay: boolean = true;
  @Input() isDeleteButton: boolean = false;

  @Input('scheduledGongs')
  set scheduledGongsArray(value: ScheduledGong[]) {
    this._scheduledGongsArray = value;
  }

  @Output() gongActiveToggleEvent = new EventEmitter<ScheduledGong>();

  @ViewChildren('cmd') customComponentChildren: QueryList<MatCheckbox>;

  const;
  translationMap = new Map<Translation_Enum, string>();

  displayedColumns = ['day', 'date', 'isOn', 'time', 'gongType', 'area', 'volume'];
  dataSource: MatTableDataSource<ScheduledGong>;

  nextGongTime: moment.Moment;

  gongTypesSubscription: Subscription;
  storeSubscription: Subscription;

  constructor(private ngRedux: NgRedux<any>,
              private storeService: StoreService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.translateNeededText();
    this.subscribeToNextGong();

    if (this.displayDay === false) {
      const indexOf = this.displayedColumns.indexOf('day');
      this.displayedColumns.splice(indexOf, 1);
    }

    this.translate.onLangChange.subscribe(() => this.translateNeededText());
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


  private subscribeToNextGong() {
    this.storeSubscription = this.ngRedux.select<BasicServerData>([StoreDataTypeEnum.DYNAMIC_DATA, 'basicServerData'])
      .subscribe((basicServerData: BasicServerData) => {
        if (basicServerData) {
          this.nextGongTime = moment(basicServerData.nextScheduledJobTime);
          this.createDataSource();
        }
      });
  }

  private gongActivationToggle(aId: number, aIsOnAction: boolean,aChkBxCtrl :MatCheckbox) {
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
          this.gongActivationToggle(aId, false,foundItem);
        }
      } else {
        this.gongActivationToggle(aId, true,foundItem);
      }
    }

    return true;
  }

  private async confirmGongDisablingOrDeletion(aIsDelete: boolean = false): Promise<boolean> {
    const title = this.translationMap.get(
      aIsDelete ? Translation_Enum.CONFIRM_DEGONG_TITLE_DELETE : Translation_Enum.CONFIRM_DEGONG_TITLE_DISABLE);

    const confirm = this.translationMap.get(
      aIsDelete ? Translation_Enum.CONFIRM_DEGONG_CONFIRM_DELETE : Translation_Enum.CONFIRM_DEGONG_CONFIRM_DISABLE);

    return await swal({
      title,
      text: this.translationMap.get(Translation_Enum.CONFIRM_DEGONG_TEXT),
      icon: '/assets/icons/alerts/icons8-error-48.png',
      className: 'confirmClass',
      dangerMode: true,
      buttons: {
        cancel: {
          text: this.translationMap.get(Translation_Enum.CONFIRM_DEGONG_CANCEL),
          value: null,
          visible: true,
        },
        confirm: {
          text: confirm,
        },
      },
    })
      .then(isConfirm => {
        return isConfirm ? isConfirm : false;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createDataSource();
  }

  private createDataSource() {
    if (this._scheduledGongsArray && this._scheduledGongsArray.length > 0) {
      // const  gongTypesMapAsync = await this.storeService.getGongTypesMapAsync();
      this.gongTypesSubscription = this.storeService.getGongTypesMap().subscribe(gongTypesMap => {
        let lastScheduledGongReord: ScheduledGong = new ScheduledGong();
        this._scheduledGongsArray.forEach((scheduledGong: ScheduledGong) => {
          scheduledGong.gongTypeName = gongTypesMap[scheduledGong.gongTypeId].name;

          if (scheduledGong.dayNumber !== lastScheduledGongReord.dayNumber) {
            lastScheduledGongReord = scheduledGong;
            lastScheduledGongReord.span = 1;
          } else {
            scheduledGong.span = 0;
            lastScheduledGongReord.span++;
          }

          scheduledGong.isAfterNextGong = scheduledGong.exactMoment.isSameOrAfter(this.nextGongTime);
          scheduledGong.isTheNextGong = scheduledGong.exactMoment.isSame(this.nextGongTime);
        });
        this.dataSource = new MatTableDataSource<ScheduledGong>(this._scheduledGongsArray);

      });
    }
  }

  ngOnDestroy(): void {
    if (this.gongTypesSubscription) {
      this.gongTypesSubscription.unsubscribe();
    }

    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
  }

}
