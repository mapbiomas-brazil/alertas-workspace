import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateMonthName'
})
export class DateMonthNamePipe implements PipeTransform {

  constructor() { }

  transform(value: any, args?: any): any {
    let date = new Date(value.toString() + ' 00:00:01');
    let month = date.toLocaleDateString('auto', { month: 'short' });
    return month && month[0].toUpperCase() + month.slice(1);
  }

}

@Pipe({
  name: 'dateFormatter'
})
export class DateFormatterPipe implements PipeTransform {

  constructor() { }

  transform(value: any, args?: any): any {
    let date = new Date(value);
    let formatted = date.toLocaleDateString();
    return formatted;
  }

}

@Pipe({
  name: 'textTruncate'
})
export class TextTruncatePipe implements PipeTransform {

  constructor() { }

  transform(value: any, args?: any): any {
    let str = Sugar.String(value);
    str = str.compact();
    str = str.truncateOnWord(parseInt(args));
    return str;
  }
}
