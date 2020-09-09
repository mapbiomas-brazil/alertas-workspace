import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { UsersService } from './users.service';
import { AlertsService } from './alerts.service';
import { TerritoriesService } from './territories.service';
import { ChartsService } from './charts.service';
import { GisService } from './gis.service';
import { RuralPropertiesService } from './rural-properties.service';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [],
  providers:[
    UsersService,
    AlertsService,
    TerritoriesService,
    RuralPropertiesService,
    ChartsService,
    GisService,
  ]
})
export class ServicesModule { }
