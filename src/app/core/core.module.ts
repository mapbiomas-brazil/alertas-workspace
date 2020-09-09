import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';

import { NgSelectModule } from '@ng-select/ng-select';

import { TranslateModule } from '../translate/translate.module';

import { PaginationLinksComponent } from './pagination-links.component';
import { SidebarDirective } from './sidebar.directive';
import { DaterangeDirective } from '../core/daterange.directive';
import { SelectTerritoriesComponent } from './select-territories.component';

import {
  DateMonthNamePipe,
  DateFormatterPipe,
  TextTruncatePipe
} from './core-utils.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    NgSelectModule,
    TranslateModule,
  ],
  declarations: [
    DateMonthNamePipe,
    DateFormatterPipe,
    TextTruncatePipe,
    PaginationLinksComponent,
    SidebarDirective,
    DaterangeDirective,
    SelectTerritoriesComponent
  ],
  exports: [
    FormsModule,
    FlexLayoutModule,
    NgSelectModule,
    TranslateModule,
    PaginationLinksComponent,
    SidebarDirective,
    DaterangeDirective,
    SelectTerritoriesComponent
  ],
  providers: []
})
export class AppCoreModule { }
