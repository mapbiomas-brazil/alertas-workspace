import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { BaseMaps } from 'src/app/map/basemaps';
import { GeometryStyles } from 'src/app/config/geometry-styles';
import { AlertStatusConfig } from 'src/app/config/alert-status';
import { Alert } from 'src/app/model/alert.entity';
import { AlertStatusList } from '../alert-status';

@Component({
  selector: 'app-alert-item-preview',
  template: `  
  <div style="height:100%">
    <div #mapAlertPreview style="height:100%"></div>
  </div>
  `,
  styles: [`.leaflet-control-attribution{display:none !important}`]
})
export class AlertItemPreviewComponent implements OnInit {

  private _alert: any;

  /**
   * Map ElementRef
   *
   * @type {ElementRef}
   * @memberof AlertsMapComponent
   */
  @ViewChild('mapAlertPreview', { static: true })
  mapAlertPreviewElem: ElementRef

  /**
   * Leaflet map instance.
   *
   * @type {*}
   * @memberof AlertsMapComponent
   */
  map: any;

  /**
   * Leaflet Preview Layer
   *
   * @type {*}
   * @memberof AlertItemPreviewComponent
   */
  previewGroupLayer = L.layerGroup();

  constructor() { }

  ngOnInit() {

    this.map = L.map(this.mapAlertPreviewElem.nativeElement, {
      center: [
        -3.1953637983293928,
        -52.18505859375
      ],
      minZoom: 3,
      maxZoom: 14,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false
    });

    // Default Base Layer
    let baseLayer = L.tileLayer(BaseMaps.GOOGLE.Satellite.url, {
      attribution: BaseMaps.GOOGLE.Satellite.attribution
    });

    this.map.addLayer(baseLayer);

    this.map.addLayer(this.previewGroupLayer);

    this.alert = this._alert;
  }

  @Input()
  public set alert(alert: Alert) {

    this._alert = alert;

    if (this.map) {

      let alertStyle = Object.assign({}, GeometryStyles.Alert.default);
      
      alertStyle.color = AlertStatusList
        .find(status => status.status == alert.status.status).color;

      let alertGeometry = alert.geometry.geometry;

      let alertGeoJSON = L.geoJSON(alertGeometry, {
        style: alertStyle
      });

      this.previewGroupLayer.clearLayers();

      this.previewGroupLayer.addLayer(alertGeoJSON);

      this.map.fitBounds(alertGeoJSON.getBounds());
    }
  }
}
