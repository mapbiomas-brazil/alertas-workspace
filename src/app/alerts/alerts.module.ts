import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppCoreModule } from '../core/core.module';
import { AlertsRoutingModule } from './alerts-routing.module';

import { MapModule } from '../map/map.module';
import { ServicesModule } from '../services/services.module';
import { ChartsModule } from '../charts/charts.module';

import { AlertListComponent } from './alert-list/alert-list.component';
import { AlertRefinementComponent } from './alert-refinement/alert-refinement.component';
import { AlertItemPreviewComponent } from './alert-list/alert-item-preview.component';
import { AlertListMapComponent } from './alert-list/alert-list-map.component';
import { AlertRefinementMapComponent } from './alert-refinement/alert-refinement-map.component';

import { AlertRefinementGeeService } from './gee/alert-refinement-gee.service';
import { AlertAuditingComponent } from './alert-auditing/alert-auditing.component';
import { AlertAuditingItemPreviewComponent } from './alert-auditing/alert-auditing-item-preview.component';
import { AlertAuditingItemModalComponent } from './alert-auditing/alert-auditing-item-modal.component';

@NgModule({
  imports: [
    CommonModule,
    AppCoreModule,
    AlertsRoutingModule,
    MapModule,
    ServicesModule,
    ChartsModule
  ],
  declarations: [
    AlertListComponent,
    AlertListMapComponent,
    AlertRefinementComponent,
    AlertRefinementMapComponent,
    AlertItemPreviewComponent,
    AlertAuditingComponent,
    AlertAuditingItemPreviewComponent,
    AlertAuditingItemModalComponent
  ],
  providers: [
    AlertRefinementGeeService
  ]
})
export class AlertsModule { }
