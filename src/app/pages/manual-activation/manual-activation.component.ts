import {Component, OnInit, ViewChild} from '@angular/core';
import {Gong} from '../../model/gong';
import {GongType} from '../../model/gongType';
import {Area} from '../../model/area';
import {NgRedux} from '@angular-redux/store';
import {MainState} from '../../store/states/main.state';
import {StoreDataTypeEnum} from '../../store/storeDataTypeEnum';
import {MatOption, MatOptionSelectionChange} from '@angular/material';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-manual-activation',
  templateUrl: './manual-activation.component.html',
  styleUrls: ['./manual-activation.component.css']
})
export class ManualActivationComponent implements OnInit {

  @ViewChild('allSelected') private allSelected: MatOption;

  areaSelectGroup: FormGroup;

  gongToPlay: Gong = new Gong();
  gongTypes: GongType[];
  areas: Area[];
  areasMap: Area[] = [];

  constructor(private ngRedux: NgRedux<any>,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.areaSelectGroup = this.fb.group({
      areaSelect: new FormControl('')
    });

    this.ngRedux.select(StoreDataTypeEnum.GENERAL).subscribe((state:MainState) => {
      // const state = this.ngRedux.getState().general;
      const areasFromStore = (state as MainState).areas;
      if (areasFromStore) {
        this.areas = areasFromStore.filter((value: Area) => value.id !== 0);
        this.areas.forEach((area: Area) => this.areasMap[area.id] = area);
      }
    });

    this.gongToPlay.type = new GongType();
    this.gongToPlay.type.id = 1;
    this.gongToPlay.areaIds = ['0'];
    this.gongToPlay.volume = 100;
    this.gongToPlay.isActive = true;

    this.constructGongTypesArray();
  }

  private constructGongTypesArray() {
    this.gongTypes = new Array<GongType>();

    Object.keys(GongType).filter(key => isNaN(Number(key))).forEach(
      key => this.gongTypes.push(GongType[key]));

  }

  playGong() {
    console.log('aaaaaaa',
      this.areaSelectGroup.controls.areaSelect.value);
  }

  onAreaChange(changeEvent) {
    // console.log('vbbbbbbb', changeEvent);
  }

  onAllAreaChange(changeEvent: MatOptionSelectionChange) {
    if (this.allSelected.selected) {
      this.areaSelectGroup.controls.areaSelect
        .patchValue([...this.areas.map(item => item.id), 0]);
    } else {
      this.areaSelectGroup.controls.areaSelect.patchValue([]);
    }
  }

  onAreaOptionChange(changeEvent: MatOptionSelectionChange) {
    if (this.allSelected.selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.areaSelectGroup.controls.areaSelect.value.length ===
      this.areas.length) {
      this.allSelected.select();
    }
  }
}
