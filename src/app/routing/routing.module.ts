import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TestPage2Component} from '../pages/test-page2/test-page2.component';
import {TestPage1Component} from '../pages/test-page1/test-page1.component';
import {ManualActivationComponent} from '../pages/manual-activation/manual-activation.component';
import {AutomaticActivationComponent} from '../pages/automatic-activation/automatic-activation.component';
import {AuthGuard} from '../auth/auth.guard';
import {LoginComponent} from '../pages/login/login.component';
import {MainPageComponent} from '../pages/main-page/main-page.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'login'},
  {path: 'login', component: LoginComponent},
  {
    path: 'mainPage', component: MainPageComponent,
    canActivate: [AuthGuard], data: {
      name: 'Main Page'
    }
  },
  {
      path: 'manualActivation', component: ManualActivationComponent,
    canActivate: [AuthGuard], data: {
      name: 'Manual Activation'
    }
  },
  {
    path: 'automaticActivation', component: AutomaticActivationComponent,
    canActivate: [AuthGuard], data: {
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
