import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TestPage2Component} from '../pages/test-page2/test-page2.component';
import {TestPage1Component} from '../pages/test-page1/test-page1.component';
import {ManualActivationComponent} from '../pages/manual-activation/manual-activation.component';
import {AutomaticActivationComponent} from '../pages/automatic-activation/automatic-activation.component';

const routes: Routes = [
  {
    path: '', pathMatch: 'full', component: ManualActivationComponent, data: {
      name: 'Manual Activation'
    }
  },
  {
    path: 'manualActivation', component: ManualActivationComponent, data: {
      name: 'Manual Activation'
    }
  },
  {
    path: 'automaticActivation', component: AutomaticActivationComponent, data: {
      name: 'Automatic Activation'
    }
  },
  {
    path: 'pageNo1', component: TestPage1Component, data: {
      name: 'page no 1'
    }
  },
  {
    path: 'pageNo2', component: TestPage2Component, data: {
      name: 'page no 2'
    }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class RoutingModule {
}
