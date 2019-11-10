import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatListOption, MatSelectionList, MatSelectionListChange} from '@angular/material/list';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';
import {NgRedux} from '@angular-redux/store';
import {BehaviorSubject, Subscription, timer} from 'rxjs';
import moment from 'moment';

import {GongType} from '../../model/gongType';
import {Area} from '../../model/area';
import {StoreService} from '../../services/store.service';
import {ScheduledGong} from '../../model/ScheduledGong';
import {UpdateStatusEnum} from '../../model/updateStatusEnum';
import {StoreDataTypeEnum} from '../../store/storeDataTypeEnum';
import {MessagesService} from '../../services/messages.service';
import {Gong} from '../../model/gong';

@Component({
  selector: 'app-manual-activation',
  templateUrl: './manual-activation.component.html',
  styleUrls: ['./manual-activation.component.css']
})
export class ManualActivationComponent implements OnInit, OnDestroy {

  @ViewChild('allAreasSelectionCtrl', {static: true}) allSelectedOptionCtrl: MatListOption;
  @ViewChild('areasSelectionCtrl', {static: true}) areasSelectionCtrl: MatSelectionList;

  gongToPlay: ScheduledGong = new ScheduledGong();
  gongTypes: GongType[];
  areas: Area[];
  areasMap: Area[] = [];

  isScheduledDatePickerOpen: boolean;
  chosenTime: Date;
  scheduleGongStartDate: Date;

  subscription: Subscription;
  scheduledGongsArray: ScheduledGong[];

  timerSubscription: Subscription;

  playGongEnabled: boolean;

  private isGongTypesArrayReady: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private ngRedux: NgRedux<any>,
              private changeDetectorRef: ChangeDetectorRef,
              private storeService: StoreService,
              private snackBar: MatSnackBar,
              private messagesService: MessagesService,
              private translateService: TranslateService) {
  }

  ngOnInit() {
    this.setOnScheduledGongsArrayChange();

    this.setOnAreasSelectionChange();

    this.setOnPlayGongEnabledChange();

    this.constructGongTypesArray();
    this.constructAreasArray();

    this.gongToPlay.areas = [];
    this.gongToPlay.volume = 100;
    this.gongToPlay.isActive = true;
    this.gongToPlay.updateStatus = UpdateStatusEnum.PENDING;
  }

  private setOnAreasSelectionChange() {
    this.areasSelectionCtrl.selectionChange.subscribe((s: MatSelectionListChange) => {
        if (s.option.value === 0) {
          if (this.gongToPlay.areas.includes(0)) {
            this.areasSelectionCtrl.selectAll();
          } else {
            this.areasSelectionCtrl.deselectAll();
          }
        } else {
          if (this.gongToPlay.areas.includes(s.option.value)) {
            if (this.gongToPlay.areas.filter(value => value > 0).length >= this.areas.length) {
              this.areasSelectionCtrl.selectAll();
            }
          } else if (this.gongToPlay.areas.includes(0)) {
            this.allSelectedOptionCtrl.toggle();
          }
        }
      }
    );
  }

  private setOnPlayGongEnabledChange() {
    this.storeService.getPlayGongEnabled().subscribe((aIsEnabled) => this.playGongEnabled = aIsEnabled);
  }

  private constructGongTypesArray() {
    this.gongTypes = [];

    this.storeService.getGongTypesMap().subscribe((gongTypesMap: GongType[]) => {
      this.gongTypes = gongTypesMap;
      this.isGongTypesArrayReady.next(true);
      if (this.gongTypes && this.gongTypes[0]) {
        this.gongToPlay.gongTypeId = this.gongTypes[0].id;
      }
    });
  }

  private constructAreasArray() {
    this.storeService.getAreasMap().subscribe(areasMap => {
      if (areasMap && areasMap.length > 0) {
        this.areas = areasMap.filter((value: Area) => value.id !== 0);
        this.areas.forEach((area: Area) => {
          this.areasMap[area.id] = area;
        });
        if (!this.changeDetectorRef['destroyed']) {
          this.changeDetectorRef.detectChanges();
        }
        this.areasSelectionCtrl.selectAll();
      }
    });
  }

  playGong() {
    const createdGong = Gong.createOutOfScheduledGong(this.gongToPlay);
    this.storeService.playGong(createdGong);
  }

  scheduleGong() {
    if (this.gongToPlay.areas.length <= 0) {
      this.translateService.get('manualActivation.messages.areaIsEmpty').subscribe(messageTrans => {
        this.snackBar.open(messageTrans, null, {
          duration: 5000,
          panelClass: 'snackBarClass',
        });
      });
      return;
    }
    this.chosenTime = undefined;
    this.computeDatePickerStartTime();
    this.isScheduledDatePickerOpen = true;
  }

  private computeDatePickerStartTime() {
    this.scheduleGongStartDate = moment().add(1, 'm').toDate();
  }

  reopen() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.computeDatePickerStartTime();
    this.isScheduledDatePickerOpen = true;
  }

  scheduledDateOnClose() {
    if (this.chosenTime) {
      if (moment().isAfter(this.chosenTime)) {
        this.timerSubscription = timer(100).subscribe(() => this.reopen());
        this.isScheduledDatePickerOpen = false;
        this.messagesService.scheduleGongToFutureTime();
        return;
      }
      this.gongToPlay.date = this.chosenTime;
      this.storeService.addManualGong(this.gongToPlay);
    }
    this.isScheduledDatePickerOpen = false;
    this.chosenTime = new Date();
  }

  private setOnScheduledGongsArrayChange() {

    this.subscription = this.ngRedux.select<ScheduledGong[]>([StoreDataTypeEnum.DYNAMIC_DATA, 'manualGongs'])
      .subscribe((scheduledGongs: ScheduledGong[]) => {
        if (scheduledGongs) {
          this.scheduledGongsArray = [];
          scheduledGongs.forEach((scheduledGong: ScheduledGong) => {
            const clonedScheduledGong = scheduledGong.cloneForUi();
            this.scheduledGongsArray.push(clonedScheduledGong);
          });
          this.scheduledGongsArray.sort((a, b) => a.date.getTime() - b.date.getTime());
        }
      });
  }

  onGongRemove(aRemovedScheduledGong: ScheduledGong) {
    this.storeService.removeScheduledGong(aRemovedScheduledGong);
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
