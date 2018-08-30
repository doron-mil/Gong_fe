import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(translate: TranslateService) {
    translate.get('general.header.information', {}).subscribe((res: string) => {
      this.title = res;
    });
  }

  clickTest1() {
    console.log('~~~~~~~~~~~~~~~~~~~~~~~ Test 1 was clicked');
  }

  clickTest2() {
    console.log('~~~~~~~~~~~~~~~~~~~~~~~ Test 2 was clicked');
  }
}
