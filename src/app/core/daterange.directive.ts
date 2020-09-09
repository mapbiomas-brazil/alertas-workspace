import { Directive, ElementRef, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[daterange]'
})
export class DaterangeDirective {

  @Output()
  dateRangeChange = new EventEmitter();

  constructor(el: ElementRef) {

    $(el.nativeElement).daterangepicker({
      showDropdowns: true,
      autoUpdateInput: false,
    }, (start, end, label) => {
      this.dateRangeChange.emit([
        start.toDate(),
        end.toDate()
      ]);
      $(el.nativeElement).val('');
    });  
  }
}
