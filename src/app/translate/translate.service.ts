import { Injectable, EventEmitter } from '@angular/core';

import Translations from './translations';
import { AppStorage } from '../app.storage';

@Injectable()
export class TranslateService {

  _language : string;

  static EventType = {
    LanguageChange: new EventEmitter(),
  };

  constructor(private appStorage: AppStorage) { }

  /**
   * Gets a translation from a determined language
   * 
   * @param {string} wordKey word key to translate
   * @param {string} lang language key 
   * @returns {string} the translation
   * @memberof TranslateService
   */
  translate(wordKey: string, lang: string = null): string {

    let translation = wordKey;

    let wordTranslations = Translations[wordKey];

    if (wordTranslations && wordTranslations[this._language]) {
      translation = wordTranslations[this._language];
    }

    return translation;
  }


  /**
   * Gets App language
   *
   * @type {string}
   * @memberof TranslateService
   */
  public get language(): string {
    if (!this._language) {
      this._language = this.appStorage.get('language') || 'en';
    }
    return this._language;
  }

  /**
   * Sets App language
   *
   * @memberof TranslateService
   */
  public set language(language: string) {
    if (language) {
      this.appStorage.set('language', language);
    } else {
      this.appStorage.delete('language');
    }
    this._language = language;
  }

}
