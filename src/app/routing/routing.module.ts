import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TestPage2Component} from '../pages/test-page2/test-page2.component';
import {TestPage1Component} from '../pages/test-page1/test-page1.component';

const routes: Routes = [
  {
    path: '', pathMatch: 'full', component: TestPage1Component, data: {
      name: 'page no 1'
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
