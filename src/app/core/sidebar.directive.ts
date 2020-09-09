import { Directive, ElementRef } from '@angular/core';

import Sidebar from "../../lib/coreui/js/sidebar";

@Directive({
  selector: '[appSidebar]'
})
export class SidebarDirective {
  constructor(el: ElementRef) {        
    new Sidebar();
  }
}
