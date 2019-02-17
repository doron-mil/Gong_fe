import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgRedux} from '@angular-redux/store';
import {Router} from '@angular/router';
import {StoreService} from './services/store.service';
import {StoreDataTypeEnum} from './store/storeDataTypeEnum';
import {BasicServerData} from './model/basicServerData';
import {Subscription, timer} from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  public now: moment.Moment;
  nextGongTime: moment.Moment;
  isManual: boolean;

  storeSubscription: Subscription;
  timerSubscription: Subscription;
  nextGongSubscription: Subscription;

  constructor(private ngRedux: NgRedux<any>,
              private storeService: StoreService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.storeSubscription = this.ngRedux.select<BasicServerData>([StoreDataTypeEnum.DYNAMIC_DATA, 'basicServerData'])
      .subscribe((basicServerData: BasicServerData) => {
        if (basicServerData) {
          this.releaseSubscriptions();
          this.now = moment(basicServerData.currentServerTime);
          const timeToNextMin = this.now.clone().endOf('minute').diff(this.now) + 1;
          this.timerSubscription = timer(timeToNextMin, 60 * 1000).subscribe((tik) => {
            if (tik === 0) {
              this.now = this.now.clone().add(timeToNextMin, 'ms');
            } else {
              this.now = this.now.clone().add(1, 'm');
            }
          });
          this.nextGongTime = moment(basicServerData.nextScheduledJobTime);
          this.isManual = basicServerData.isManual;
          const timeToNextScheduledJob = this.nextGongTime.clone().startOf('minute').add(1, 'm');
          this.nextGongSubscription = timer(timeToNextScheduledJob.toDate()).subscribe(() => {
            this.getBasicData();
          });
        }
      });
    this.getBasicData();
  }

  getBasicData(): void {
    this.storeService.getBasicData();
  }

  releaseSubscriptions(aIsAlsoStore: boolean = false): void {
    if (this.storeSubscription && aIsAlsoStore) {
      this.storeSubscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.nextGongSubscription) {
      this.nextGongSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.releaseSubscriptions(true);
  }

}
