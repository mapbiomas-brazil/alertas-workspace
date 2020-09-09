import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { Territory } from '../model/territory.entity';
import { Observable, of, Subject, concat } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { TerritoriesService } from '../services/territories.service';
import { ServiceResponse } from '../services/service-response';

@Component({
  selector: 'app-select-territories',
  template: `
    <ng-select [items]="territories$ | async" [multiple]="true" [hideSelected]="true"
      [minTermLength]="2" [loading]="territoriesLoading" [typeahead]="territoryInput$"
      [(ngModel)]="territories" (change)="territoryChange($event)" typeToSearchText="Search a territory" bindLabel="name"
      placeholder="Select a territory" required>
      <ng-template ng-option-tmp let-item="item" let-index="index" let-search="searchTerm">
        {{item.name}} ({{item.categoryName}})
      </ng-template>
    </ng-select>  
  `
})
export class SelectTerritoriesComponent implements OnInit, OnChanges {

  @Input('territories')
  territories: Territory[];

  @Output()
  change = new EventEmitter<Territory[]>();

  /**
   * Territories
   *
   * @type {Observable<any[]>}
   * @memberof AlertListComponent
   */
  territories$: Observable<Territory[]>;

  territoriesLoading = false;

  territoryInput$ = new Subject<string>();

  constructor(
    private territoriesService: TerritoriesService
  ) {

  }

  ngOnInit() {
    this.loadTerritories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    
  }

  /**
   * Loads territory data
   *
   * @memberof AlertListComponent
   */
  loadTerritories() {

    this.territories$ = concat(
      of([]),
      this.territoryInput$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.territoriesLoading = true),
        switchMap(term => {
          let query = {
            name: term,
            categories: 'city,state,biome'
          };
          return this.territoriesService.list(query).pipe(
            switchMap((result: ServiceResponse<Territory[]>) => {
              return new Observable<Territory[]>(subscriber => {
                subscriber.next(result.data);
                subscriber.complete();
                this.territoriesLoading = false;
              })
            })
          )
        })
      )
    );
  }

  territoryChange(event) {
    this.territories = event;
    this.change.emit(this.territories);
  }

}

