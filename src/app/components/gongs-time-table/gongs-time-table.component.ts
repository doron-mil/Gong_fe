import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {ScheduledGong} from '../../model/ScheduledGong';
import {StoreService} from '../../services/store.service';

@Component({
  selector: 'app-gongs-time-table',
  templateUrl: './gongs-time-table.component.html',
  styleUrls: ['./gongs-time-table.component.css']
})
export class GongsTimeTableComponent implements OnInit, OnChanges {

  private _scheduledGongsArray: ScheduledGong[];

  @Input() displayDay: boolean = true;
  @Input() isDeleteButton: boolean = false;

  @Input('scheduledGongs')
  set scheduledGongsArray(value: ScheduledGong[]) {
    this._scheduledGongsArray = value;
  }


  displayedColumns = ['day', 'date', 'isOn', 'time', 'gongType', 'area', 'volume'];
  dataSource: MatTableDataSource<ScheduledGong>;

  constructor(private storeService: StoreService) {
  }

  ngOnInit() {
    this.createDataSource();

    if (this.displayDay === false) {
      const indexOf = this.displayedColumns.indexOf('day');
      this.displayedColumns.splice(indexOf, 1);
    }
  }

  gongToggle() {
    return undefined;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createDataSource();
  }


  private createDataSource() {
    if (this._scheduledGongsArray && this._scheduledGongsArray.length > 0) {
      // const  gongTypesMapAsync = await this.storeService.getGongTypesMapAsync();
      this.storeService.getGongTypesMap().subscribe(gongTypesMap => {
        let lastScheduledGongReord: ScheduledGong = new ScheduledGong();
        this._scheduledGongsArray.forEach(scheduledGong => {
          scheduledGong.gongTypeName = gongTypesMap[scheduledGong.gongTypeId].name;

          if (scheduledGong.dayNumber !== lastScheduledGongReord.dayNumber) {
            lastScheduledGongReord = scheduledGong;
            lastScheduledGongReord.span = 1;
          } else {
            scheduledGong.span = 0;
            lastScheduledGongReord.span++;
          }

        });
        this.dataSource = new MatTableDataSource<ScheduledGong>(this._scheduledGongsArray);

      });
    }
  }
}