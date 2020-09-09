import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlertListComponent } from './alert-list/alert-list.component';
import { AlertRefinementComponent } from './alert-refinement/alert-refinement.component';
import { AlertAuditingComponent } from './alert-auditing/alert-auditing.component';

const routes: Routes = [
  {
    path: '',
    component: AlertListComponent
  },  
  {
    path: 'refinement/:id',
    component: AlertRefinementComponent
  },
  {
    path: 'auditing',
    component: AlertAuditingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertsRoutingModule { }