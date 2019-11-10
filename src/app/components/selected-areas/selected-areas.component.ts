import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Area} from '../../model/area';
import {NgRedux} from '@angular-redux/store';
import {MainState} from '../../store/states/main.state';
import {StoreService} from '../../services/store.service';

@Component({
  selector: 'app-selected-areas',
  templateUrl: './selected-areas.component.html',
  styleUrls: ['./selected-areas.component.scss']
})
export class SelectedAreasComponent implements OnInit, OnChanges {

  @Input() selectedAreas: number[];
  @Input() className: string;
  areasDisplayResult: string;

  constructor(private storeService: StoreService) {
  }

  ngOnInit() {
    this.computeDisplay();
  }

  computeDisplay() {
    this.storeService.getAreasMap().subscribe((areasMap: Area[]) => {
      this.areasDisplayResult = '';

      if (areasMap && areasMap.length > 0 && this.selectedAreas && this.selectedAreas.length > 0) {
        const areasCount = areasMap.length;
        if (this.selectedAreas.includes(0) ||
          this.selectedAreas.length >= areasMap.length - 1) {
          this.areasDisplayResult = areasMap[0].translation;
        } else {
          this.selectedAreas.forEach((value, index) => {
            this.areasDisplayResult += ((index > 0) ? ',' : '') + areasMap[value].translation;
          });
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.selectedAreas = changes.selectedAreas.currentValue;
    this.computeDisplay();
  }

}
