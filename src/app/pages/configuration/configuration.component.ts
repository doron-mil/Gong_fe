import {Component, ComponentFactoryResolver, OnInit, ViewChild} from '@angular/core';
import {DeviceSetupComponent} from './device-setup/device-setup.component';
import {AreasI18nComponent} from './areas-i18n/areas-i18n.component';
import {ConfigPageHostDirective} from '../../shared/config-page-host.directive';

interface IComponentRecord {
  name: string;
  component: any;
}

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  @ViewChild(ConfigPageHostDirective, {static: true}) mainConfigTemplateCtrl: ConfigPageHostDirective;

  componentsArray: IComponentRecord[] = [];
  selectedComponent: IComponentRecord;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    this.constructComponentsArray();
  }

  ngOnInit() {
    this.displayComponent(this.selectedComponent);
  }

  private constructComponentsArray() {
    this.componentsArray.push({name: 'deviceSetup', component: DeviceSetupComponent});
    this.componentsArray.push({name: 'AreasI18n', component: AreasI18nComponent});

    this.selectedComponent = this.componentsArray[0];
  }

  displayComponent(aComponent: IComponentRecord) {
    this.selectedComponent = aComponent;

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(aComponent.component);

    const viewContainerRef = this.mainConfigTemplateCtrl.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    // (<AdComponent>componentRef.instance).data = adItem.data;
  }

}
