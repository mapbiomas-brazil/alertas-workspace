import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pagination-links',
  template: `
    <nav aria-label="pagination">
      <ul class="pagination justify-content-center">        
        <li *ngFor="let link of pageLinks" [ngClass]="{'active':(pagination &&link.page == pagination.page)}" class="page-item">
          <a href="javascript:;" (click)="paginateClick(link.page)" class="page-link">{{link.label}}</a>
        </li>      
      </ul>
    </nav>    
  `
})
export class PaginationLinksComponent{

  @Input() pagination;

  @Output() paginate = new EventEmitter();

  pageLinks = [];  
 

  ngOnChanges() {

    if (!this.pagination) {
      return;
    }

    let pageLinks = [];

    let limit0 = parseInt(this.pagination.page) - 1;
    let limit1 = parseInt(this.pagination.page) + 2;

    if (this.pagination.page > 1) {
      pageLinks.push({ page: 1, label: '<<' });
    }

    for (let page = limit0; page < this.pagination.page; page++) {
      if (page > 1 && page < this.pagination.page) {
        pageLinks.push({ page: page, label: page });
      }
    }

    pageLinks.push({ page: this.pagination.page, label: this.pagination.page });

    for (let page = this.pagination.page; page <= limit1; page++) {
      if (page > this.pagination.page && page < this.pagination.totalPages) {
        pageLinks.push({ page: page, label: page });
      }
    }
    
    if (this.pagination.page < this.pagination.totalPages) {      
      pageLinks.push({ page: this.pagination.totalPages, label: this.pagination.totalPages });
    }

    this.pageLinks = pageLinks;
  }

  paginateClick(page: Number) {
    this.paginate.emit(page);
  }

}