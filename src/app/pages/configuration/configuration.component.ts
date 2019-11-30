import {Component, ComponentFactoryResolver, OnInit, ViewChild} from '@angular/core';
import {DeviceSetupComponent} from './device-setup/device-setup.component';
import {I18nEditingComponent} from './i18n-editing/i18n-editing.component';
import {ConfigPageHostDirective} from '../../shared/config-page-host.directive';
import {BaseComponent} from '../../shared/baseComponent';

interface IComponentRecord {
  name: string;
  component: any;
}

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent extends BaseComponent  {

  @ViewChild(ConfigPageHostDirective, {static: true}) mainConfigTemplateCtrl: ConfigPageHostDirective;

  componentsArray: IComponentRecord[] = [];
  selectedComponent: IComponentRecord;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    super();
    this.constructComponentsArray();
  }

  protected hookOnInit() {
    this.displayComponent(this.selectedComponent);
  }

  private constructComponentsArray() {
    this.componentsArray.push({name: 'i18n', component: I18nEditingComponent});
    this.componentsArray.push({name: 'deviceSetup', component: DeviceSetupComponent});

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
