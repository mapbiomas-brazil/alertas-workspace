import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BaseMaps } from 'src/app/map/basemaps';
import { Alert } from 'src/app/model/alert.entity';
import { GeometryStyles } from 'src/app/config/geometry-styles';
import { AlertStatusConfig } from 'src/app/config/alert-status';
import { Geometry } from 'geojson';
import { environment } from 'src/environments/environment';
import { AlertsService } from 'src/app/services/alerts.service';
import { AlertStatusValue, AlertStatusList } from '../alert-status';
import { SocketServerEvent } from 'src/app/socket/socket-server-event';
import { SocketEventData } from 'src/app/socket/socket-event-data';


@Component({
  selector: 'app-alert-list-map',
  template: `
  <div #map style="height: 100%;width=:100%"></div>
  <ng-content></ng-content>
  `,
})
export class AlertListMapComponent implements OnInit {

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

  /**
   * Leaflet Alert Layer
   *
   * @type {*}
   * @memberof AlertItemPreviewComponent
   */
  alertLayer: any = L.layerGroup();

  /**
   * Leaflet Alert Refinig by users Layer
   *
   * @type {*}
   * @memberof AlertItemPreviewComponent
   */
  alertsRefiningLayer: any = L.layerGroup();

  /**
   * leaflet layer control
   *
   * @memberof AlertRefinementMapComponent
   */
  layersCtrl;

  referenceLayers = {
    google: BaseMaps.GOOGLE.Satellite.laefletLayer(),
    osm: BaseMaps.OSM.Standard.laefletLayer(),
    publishedAlerts: BaseMaps.MapBiomas.Alertas.WMS.laefletLayer()
  };

  constructor() { }

  ngOnInit() {

    // Init Map 
    this.map = L.map(this.mapElement.nativeElement, {
      center: [
        -12.425847783029134,
        -54.228515625
      ],
      zoom: 5,
      minZoom: 5,
      maxZoom: 16,
      zoomControl: true
    });

    L.control.scale().addTo(this.map);

    this.map.addLayer(this.referenceLayers.osm);

    this.map.addLayer(this.alertLayer);

    this.map.addLayer(this.alertsRefiningLayer);

    // Init Events
    this.initEvents();

    this.initLayerControl();
  }


  /**
   * Sets alerts filter
   *
   * @param {*} filter
   * @memberof AlertListMapComponent
   */
  setAlertsFilter(alertsFilter: any) {

    let cqlFilter = '';

    let query1 = [];

    alertsFilter.id && (query1.push(`id='${alertsFilter.id}'`));
    alertsFilter.biome && (query1.push(`territorio_ids ILIKE '%-${alertsFilter.biome.id}-%'`));
    alertsFilter.state && (query1.push(`territorio_ids ILIKE '%-${alertsFilter.state.id}-%'`));
    alertsFilter.city && (query1.push(`territorio_ids ILIKE '%-${alertsFilter.city.id}-%'`));
    alertsFilter.teamTerritoryId && (query1.push(`territorio_ids ILIKE '%-${alertsFilter.teamTerritoryId}-%'`));
    alertsFilter.teamUserId && (query1.push(`user_ids ILIKE '%-${alertsFilter.teamUserId}-%'`));
    alertsFilter.statusId && (query1.push(`status='${alertsFilter.statusId}'`));

    if (alertsFilter.dateStart) {
      query1.push(`(dt_deteccao BETWEEN ${alertsFilter.dateStart} AND ${alertsFilter.dateEnd})`)
    }

    if (query1.length > 0) {
      cqlFilter = query1.join(' AND ');
    }

  }

  /**
   * Zoom on a alert
   *
   * @param {Alert} alert
   * @memberof AlertListMapComponent
   */
  viewAlert(alert: Alert) {

    let alertStyle = Object.assign({}, GeometryStyles.Alert.default);
    alertStyle.color = AlertStatusList
      .find(status => status.status == alert.status.status).color;

    let alertGeometry = alert.geometry.geometry;

    let alertGeoJSON = L.geoJSON(alertGeometry, {
      style: alertStyle
    });

    this.alertLayer.clearLayers();
    this.alertLayer.addLayer(alertGeoJSON);
    this.map.fitBounds(alertGeoJSON.getBounds());
  }

  /**
   * Zoom on a geometry
   *
   * @param {Geometry} geometry
   * @memberof AlertListMapComponent
   */
  fitBoundGeometry(geometry: Geometry) {
    let alertGeoJSON = L.geoJSON(geometry);
    this.map.fitBounds(alertGeoJSON.getBounds());
  }

  /**
   * Sets zoom map to initial state
   *
   * @memberof AlertListMapComponent
   */
  resetZoom() {
    this.map.setView([
      -12.425847783029134,
      -54.228515625
    ]);
    this.map.setZoom(5);
  }

  /**
   * Initialize layer control
   *
   * @memberof AlertListMapComponent
   */
  initLayerControl() {

    let baseLayers = {
      "Open Street Maps": this.referenceLayers.osm,
      "Google Satellite": this.referenceLayers.google
    };

    let groupedOverlays = {
      'Published Alerts': this.referenceLayers.publishedAlerts,
    };


    var options = {
      collapsed: false,
      position: 'bottomright',
    };

    if (this.layersCtrl) {
      this.map.removeControl(this.layersCtrl);
    }

    this.layersCtrl = L.control.layers(baseLayers, groupedOverlays, options).addTo(this.map);

    this.map.addControl(this.layersCtrl);
  }


  /**
   * Init map event 
   *
   * @private
   * @memberof AlertsMapComponent
   */
  private initEvents() {

    SocketServerEvent.ALERTS_REFINING.subscribe(eventData => {

      this.alertsRefiningLayer.clearLayers();

      if (eventData.data && eventData.data.length > 0) {
        eventData.data.forEach((alertRefinig) => {
          let point = turf.centroid(alertRefinig.alert.geometry.geometry);

          let markerIcon = L.icon({
            iconUrl: alertRefinig.user.photo,
            iconSize: [35, 35],
            className: 'map-marker-user'
          });

          let marker = L.geoJSON(point).getLayers()[0];

          marker.setIcon(markerIcon);

          this.alertsRefiningLayer.addLayer(marker);
        });
      }

    });

  }
}
