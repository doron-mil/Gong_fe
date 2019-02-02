import {Component, OnInit, ViewChild} from '@angular/core';
import {Gong} from '../../model/gong';
import {GongType} from '../../model/gongType';
import {Area} from '../../model/area';
import {MainState} from '../../store/states/main.state';
import {StoreDataTypeEnum} from '../../store/storeDataTypeEnum';
import {MatListOption, MatOption, MatOptionSelectionChange, MatSelectionList, MatSelectionListChange} from '@angular/material';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {StoreService} from '../../services/store.service';

@Component({
  selector: 'app-manual-activation',
  templateUrl: './manual-activation.component.html',
  styleUrls: ['./manual-activation.component.css']
})
export class ManualActivationComponent implements OnInit {

  @ViewChild('allAreasSelectionCtrl') allSelectedOptionCtrl: MatListOption;
  @ViewChild('areasSelectionCtrl') areasSelectionCtrl: MatSelectionList;

  gongToPlay: Gong = new Gong();
  gongTypes: GongType[];
  areas: Area[];
  areasMap: Area[] = [];

  selectedAreaOptions: number[] = [];

  constructor(private storeService: StoreService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.areasSelectionCtrl.selectionChange.subscribe((s: MatSelectionListChange) => {
        if (s.option.value === 0) {
          if (this.selectedAreaOptions.includes(0)) {
            this.areasSelectionCtrl.selectAll();
          } else {
            this.areasSelectionCtrl.deselectAll();
          }
        } else {
          if (this.selectedAreaOptions.includes(s.option.value)) {
            if (this.selectedAreaOptions.filter(value => value > 0).length >= this.areas.length) {
              this.areasSelectionCtrl.selectAll();
            }
          } else if (this.selectedAreaOptions.includes(0)) {
            this.allSelectedOptionCtrl.toggle();
          }
        }
      }
    );

    this.constructGongTypesArray();
    this.constructAreasArray();

    this.gongToPlay.type = new GongType();
    this.gongToPlay.type.id = 1;
    this.gongToPlay.areaIds = ['0'];
    this.gongToPlay.volume = 100;

    this.gongToPlay.isActive = true;
  }

  private constructGongTypesArray() {
    this.gongTypes = [];

    this.storeService.getGongTypesMap().subscribe((gongTypesMap: GongType[]) => {
      this.gongTypes = gongTypesMap;
    });
  }

  private constructAreasArray() {
    this.storeService.getAreasMap().subscribe(areasMap => {
      if (areasMap && areasMap.length > 0) {
        this.areas = areasMap.filter((value: Area) => value.id !== 0);
        this.areas.forEach((area: Area) => this.areasMap[area.id] = area);
      }
    });
  }

  playGong() {
    console.log('aaaaaaa', this.selectedAreaOptions);
  }
}
