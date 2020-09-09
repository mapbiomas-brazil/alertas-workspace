import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { environment } from 'src/environments/environment';
import { BaseMaps } from 'src/app/map/basemaps';

@Component({
  selector: 'app-dashboard-map',
  template: `
  <div #map style="height: 100%;width=:100%"></div>
  <ng-content></ng-content>
  `,

})
export class DashboardMapComponent implements OnInit {

  /**
   * Map ElementRef
   *
   * @type {ElementRef}
   * @memberof AlertsMapComponent
   */
  @ViewChild('map', { static: true })
  private mapElement: ElementRef;


  /**
   * Leaflet map instance.
   *
   * @type {*}
   * @memberof AlertsMapComponent
   */
  map: any;

  constructor() { }

  ngOnInit() {

    // Init Map 
    this.map = L.map(this.mapElement.nativeElement, {
      center: [
        -12.425847783029134,
        -54.228515625
      ],
      zoom: 5,
      minZoom: 4,
      maxZoom: 16,
      zoomControl: false
    });

  }

}
