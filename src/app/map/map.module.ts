import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppCoreModule } from '../core/core.module';

import { BaseMaps } from './basemaps';

@NgModule({
  imports: [
    CommonModule,
    AppCoreModule
  ],
  declarations: [],
  exports: [],
  providers: [
    BaseMaps
  ]
})
export class MapModule { }
