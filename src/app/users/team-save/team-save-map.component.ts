import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { Geometry } from 'geojson';

import { BaseMaps } from 'src/app/map/basemaps';

import { Territory } from 'src/app/model/territory.entity';


@Component({
  selector: 'app-team-save-map',
  template: `
  <div #map style="height: 100%;width=:100%"></div>
  <ng-content></ng-content>
  `,
})
export class TeamSaveMapComponent implements OnInit {

  static Events = {
    GeometrySelected: new EventEmitter<Geometry>(),
  };

  /**
   * Map ElementRef
   *
   * @type {ElementRef}
   * @memberof UserSaveMapComponent
   */
  @ViewChild('map', { static: true })
  private mapElement: ElementRef;


  /**
   * Leaflet map instance.
   *
   * @type {*}
   * @memberof UserSaveMapComponent
   */
  map: any;

  
  /**
   * Alerts wms layer
   *
   * @type {L.TileLayerWMS}
   * @memberof AlertListMapComponent
   territoriesLayer: any = L.tileLayer.wms(BaseMaps.MapBiomas.WMS.url, {
     layers: 'alerts-platform:geo_mapbiomas_territorio',
     format: 'image/png',
     styles: 'style-params',
     cql_filter: 'id IN (0)',
     env: 'style_opacity:0.5;style_fill:#0000ff;style_stroke:#0000ff',
     transparent: true
    });
 */

  constructor() { }

  ngOnInit() {

    // Init Map 
    this.map = L.map(this.mapElement.nativeElement, {
      center: [
        -12.425847783029134,
        -54.228515625
      ],
      zoom: 4,
      minZoom: 4,
      maxZoom: 16,
      zoomControl: true
    });

    L.control.scale().addTo(this.map);

    this.map.addLayer(BaseMaps.OSM.Standard.laefletLayer());

    // init layers
    this.initLayers();
  }

  initLayers() {
    // All Alerts WMS    
  }

  /**
   * Sets territories on map
   *
   * @param {Territory[]} territories
   * @memberof UserSaveMapComponent
   */
  setTerritories(territories: Territory[]) {

    let cqlFilter = '';

    let territoriesId = territories.map(territory => {
      return territory.id
    });

    cqlFilter += `id IN (${territoriesId})`;

   /*  this.territoriesLayer.setParams({
      cql_filter: cqlFilter
    }); */

    /* this.territoriesLayer.redraw(); */
    
    /* if (territories && territories[0] && territories[0].geometries) {
      let featureCollection = turf.featureCollection(territories.filter(territory => territory.geometries).map(territory => {
        return territory.geometries.envelope;
      }));
      this.map.fitBounds(L.geoJSON(featureCollection).getBounds());
    } */
  }

}
