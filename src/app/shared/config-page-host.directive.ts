import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[appConfigPageHost]'
})
export class ConfigPageHostDirective {

  constructor(public viewContainerRef: ViewContainerRef) {
  }

}
