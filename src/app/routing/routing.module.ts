import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ManualActivationComponent} from '../pages/manual-activation/manual-activation.component';
import {AutomaticActivationComponent} from '../pages/automatic-activation/automatic-activation.component';
import {AuthGuard} from '../auth/auth.guard';
import {LoginComponent} from '../pages/login/login.component';
import {MainPageComponent} from '../pages/main-page/main-page.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'loginPage'},
  {path: 'loginPage', component: LoginComponent},
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class RoutingModule {
}
