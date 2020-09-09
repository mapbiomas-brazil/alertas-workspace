import { Directive, ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { TranslateService } from './translate.service';


@Directive({
  selector: '[translate]'
})
export class TranslateDirective {

  private elem: any;
  private elemTranlate: any;
  private text: string;


  constructor(
    private element: ElementRef,
    private viewContainer: ViewContainerRef,
    private translateService: TranslateService
  ) {

    TranslateService.EventType.LanguageChange.subscribe((lang: string) => {
      let translation = this.translateService.translate(this.text, lang);
      this.elemTranlate.text(translation);
    });
  }

  ngOnInit(): any {
    let translatekey;
    this.elem = $(this.element.nativeElement);    
    translatekey = this.elem[0].outerText;
    let translateAttr = this.elem.attr('translate');
    if (translateAttr.length > 0) {
      translatekey = translateAttr;
    }
    let translation = this.translateService.translate(translatekey);    
    this.elem.text(translation);
  }
}