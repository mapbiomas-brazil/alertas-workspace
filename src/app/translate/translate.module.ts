import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateDirective } from './translate.directive';
import { TranslateService } from './translate.service';
import { TranslatePipe } from './translate.pipe';
import { SelectLanguageComponent } from './select-language/select-language.component';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [    
    TranslateService
  ],
  declarations: [
    TranslateDirective,
    TranslatePipe,
    SelectLanguageComponent
  ],
  exports: [
    SelectLanguageComponent,
    TranslateDirective,
    TranslatePipe
  ],  
})
export class TranslateModule { }
