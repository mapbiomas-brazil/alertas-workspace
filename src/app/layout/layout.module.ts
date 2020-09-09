import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppCoreModule } from '../core/core.module';

import { MenuMainComponent } from './menu-main/menu-main.component';



@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AppCoreModule
  ],
  declarations: [
    MenuMainComponent
  ],
  exports: [
    MenuMainComponent
  ],
})
export class LayoutModule { }
