import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NgRedux} from '@angular-redux/store';
import {readToStoreData} from './store/actions/action';
import {MatSlideToggleChange} from '@angular/material';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  isManual = true;
  activeLink = 1;

  constructor(private ngRedux: NgRedux<any>,
              // private storeService: StoreService,
              private router: Router,
              translate: TranslateService) {
    translate.get('general.header.information', {}).subscribe((res: string) => {
      this.title = res;
    });
  }

  ngOnInit(): void {
    // this.readToStore();
  }

  private readToStore() {
    this.ngRedux.dispatch(readToStoreData());
    // this.storeService.getAreasMap();
  }

  clickTest1() {
    console.log('~~~~~~~~~~~~~~~~~~~~~~~ Test 1 was clicked');
  }

  clickTest2() {
    console.log('~~~~~~~~~~~~~~~~~~~~~~~ Test 2 was clicked');
  }

  onClick() {
    console.log('xxxxxxxxd', this.isManual);
    this.isManual = !this.isManual;
  }

  onManualChange(changeEvent: MatSlideToggleChange) {
    if (this.isManual) {
      this.router.navigate(['/manualActivation']);
    } else {
      this.router.navigate(['/automaticActivation']);
    }
  }
}
