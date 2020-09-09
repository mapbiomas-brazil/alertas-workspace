import { Component, OnInit } from '@angular/core';
import { TranslateService } from '../translate.service';

@Component({
  selector: 'app-select-language',
  templateUrl: './select-language.component.html',
  styleUrls: ['./select-language.component.css']
})
export class SelectLanguageComponent implements OnInit {

  laguages = {
    "pt-br": "Portuguese",
    "en": "English",
    "es": "Espanol"
  };

  laguageSelected;

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.laguageSelected = this.translate.language;
  }
  
  
  /**
   * Select App language
   * 
   * @param {string} lang 
   * @memberof AppComponent
   */
  selectLanguage(lang: string) {    
    this.translate.language = lang;
    this.laguageSelected = lang;
    window.location.reload();
  }

}
