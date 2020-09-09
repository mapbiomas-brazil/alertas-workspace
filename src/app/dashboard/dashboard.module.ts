import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppCoreModule } from '../core/core.module';

import { DashboardRoutingModule } from './dashboard-routing.module';

import { MapModule } from '../map/map.module';
import { ChartsModule } from '../charts/charts.module';

import { DashboardComponent } from './dashboard.component';
import { DashboardMapComponent } from './dashboard-map.component';

@NgModule({
  imports: [
    CommonModule,
    AppCoreModule,
    DashboardRoutingModule,
    MapModule,
    ChartsModule
  ],
  declarations: [
    DashboardComponent,
    DashboardMapComponent
  ]
})
export class DashboardModule { }
