import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppCoreModule } from '../core/core.module';
import { ServicesModule } from '../services/services.module';

import { Chart1Component } from './chart1.component';
import { Chart2Component } from './chart2.component';
import { Chart3Component } from './chart3.component';


@NgModule({
  imports: [
    CommonModule,
    AppCoreModule,
    ServicesModule
  ],
  declarations: [
    Chart1Component,
    Chart2Component,
    Chart3Component,
  ],
  exports: [
    Chart1Component,
    Chart2Component,
    Chart3Component,
  ],
})
export class ChartsModule { }
