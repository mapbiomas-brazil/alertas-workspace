import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { Geometry } from 'geojson';

import { BaseMaps } from 'src/app/map/basemaps';

import { Territory } from 'src/app/model/territory.entity';


@Component({
  selector: 'app-user-save-map',
  template: `
  <div #map style="height: 100%;width=:100%"></div>
  <ng-content></ng-content>
  `,
})
export class UserSaveMapComponent implements OnInit {

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
   * Drawing Control
   *
   * @type {L.Control.Draw}
   * @memberof UserSaveMapComponent
   */
  drawControl: any;

  /**
   * Draw default options
   *
   * @memberof UserSaveMapComponent
   */
  drawDefaultOpts = {
    position: 'topright',
    draw: {
      polygon: {
        allowIntersection: false,
        showArea: true
      },
      rectangle: {
        showArea: true
      },
      circle: false,
      polyline: false,
      marker: false,
      circlemarker: false
    }
  };

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

    let drawOptions = Object.assign({}, this.drawDefaultOpts);
    this.drawControl = new L.Control.Draw(drawOptions)
    this.map.addControl(this.drawControl);

    // init layers
    this.initLayers();
    this.initEvents();
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
    });

    this.territoriesLayer.redraw(); */
    
    /* if (territories && territories[0] && territories[0].geometries) {
      let featureCollection = turf.featureCollection(territories.filter(territory => territory.geometries).map(territory => {
        return territory.geometries.envelope;
      }));
      this.map.fitBounds(L.geoJSON(featureCollection).getBounds());
    } */
  }
  
  
  /**
   * Sets team territory on map
   *
   * @param {number} territoryId
   * @memberof UserSaveMapComponent
   */
  setTeamTerritoryId(territoryId: number) {

    let cqlFilter = '';

    cqlFilter += `id IN (${territoryId})`;

    /* this.teamTerritoryLayer.setParams({
      cql_filter: cqlFilter
    });

    this.territoriesLayer.redraw(); */
  }


  /**
  * Init map event 
  *
  * @private
  * @memberof UserSaveMapComponent
  */
  private initEvents() {

    /**
     * Drawn Event
     */
    this.map.on('draw:created', (e) => {
      let layer = e.layer;
      UserSaveMapComponent.Events.GeometrySelected.emit(layer.toGeoJSON().geometry);
    });

  }

}
