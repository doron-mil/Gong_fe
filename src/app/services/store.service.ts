import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {NgRedux} from '@angular-redux/store';
import {Area} from '../model/area';
import {MainState} from '../store/states/main.state';
import {TranslateService} from '@ngx-translate/core';
import {StoreDataTypeEnum} from '../store/storeDataTypeEnum';
import {Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService implements OnInit, OnDestroy {

  areasMap: Area[] = [];
  subscriptionsArray: Subscription[] = [];

  constructor(private ngRedux: NgRedux<any>,
              private translateService: TranslateService) {
    this.populateAreasMap();
  }

  private populateAreasMap() {
    const areaSubscription = this.ngRedux.select<Area[]>([StoreDataTypeEnum.GENERAL, 'areas']).subscribe((areaArry: Area[]) => {

      if (areaArry && areaArry.length > 0) {
        this.areasMap = [];
        areaArry.forEach((area: Area) => {
          this.translateService.get('general.typesValues.areas.values.' + area.name).subscribe(areaTrans => {
            area.translation = areaTrans;
          });
          this.areasMap[area.id] = area;
        });
      }
    });

    this.subscriptionsArray.push(areaSubscription);
  }

  ngOnInit(): void {
  }

  getAreasMap(): Area[] {
    return this.areasMap;
  }

  ngOnDestroy(): void {
    this.subscriptionsArray.forEach(subscription => subscription.unsubscribe());
    console.log('c1');
  }


}
