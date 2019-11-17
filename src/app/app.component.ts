import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import {BaseComponent} from './shared/baseComponent';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends BaseComponent {


  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) {

    super();

    this.addSvgIcons();
  }

  private addSvgIcons() {
    this.matIconRegistry.addSvgIcon(
      'lang_he',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/lang/he.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'lang_en',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/lang/en.svg')
    );
  }


}
