import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

import { GeometryStyles } from 'src/app/config/geometry-styles';
import { BaseMaps } from 'src/app/map/basemaps';
import { GeeMapId, MapId } from '../gee/gee-mapid';

import { Alert } from 'src/app/model/alert.entity';

import { AlertRefinementGeeService } from '../gee/alert-refinement-gee.service';
import { AlertsService } from 'src/app/services/alerts.service';

@Component({
  selector: 'app-alert-auditing-item-modal',
  templateUrl: './alert-auditing-item-modal.component.html',
  styles: [`.leaflet-control-attribution{display:none !important}`]
})
export class AlertAuditingItemModalComponent implements OnInit {

  /**
   * Modal html element
   *
   * @type {ElementRef}
   * @memberof AlertAuditingItemModalComponent
   */
  @ViewChild('elertModal', { static: true })
  elertModalElem: ElementRef;

  /**
   * Map ElementRef
   *
   * @type {ElementRef}
   * @memberof AlertsMapComponent
   */
  @ViewChild('mapAlertRefined', { static: true })
  mapAlertRefinedElem: ElementRef;

  /**
   * Leaflet map instance.
   *
   * @type {*}
   * @memberof AlertsMapComponent
   */
  map: any;

  /**
   * Alert data
   *
   * @private
   * @type {Alert}
   * @memberof AlertAuditingItemModalComponent
   */
  private alert: Alert;

  /**
   * Alert Geometry layer
   *
   * @memberof AlertAuditingItemModalComponent
   */
  alertRefined = L.layerGroup();

  /**
   * Alert Refinement Boundery
   *
   * @memberof AlertAuditingItemModalComponent
   */
  boundery = L.layerGroup();

  /**
   * Alert Refinement Deforestation Samples
   *
   * @memberof AlertAuditingItemModalComponent
   */
  deforestation = L.layerGroup();


  /**
   * Alert Refinement notDeforestation Samples
   * 
   * @memberof AlertAuditingItemModalComponent
   */
  notDeforestation = L.layerGroup();

  /**
   * Image before layer
   *
   * @type {L.LayerGroup}
   * @memberof AlertAuditingItemModalComponent
   */
  imageBeforeLayer: any = L.layerGroup();

  /**
   * Image after layer
   *
   * @type {L.LayerGroup}
   * @memberof AlertAuditingItemModalComponent
   */
  imageAfterLayer: any = L.layerGroup();

  layersCtrl;

  referenceLayers = {
    google: BaseMaps.GOOGLE.Satellite.laefletLayer(),
    osm: BaseMaps.OSM.Standard.laefletLayer(),
    publishedAlerts: BaseMaps.MapBiomas.Alertas.WMS.laefletLayer()
  };


  constructor(
    private alertRefinementGee: AlertRefinementGeeService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {

    this.map = L.map(this.mapAlertRefinedElem.nativeElement, {
      center: [
        -3.1953637983293928,
        -52.18505859375
      ],
      minZoom: 3,
      //maxZoom: 14,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true
    });

    // Default Base Layer
    let baseLayer = L.tileLayer(BaseMaps.GOOGLE.Satellite.url, {
      attribution: BaseMaps.GOOGLE.Satellite.attribution
    });

    this.map.addLayer(baseLayer);

    this.map.addLayer(this.imageBeforeLayer);
    this.map.addLayer(this.imageAfterLayer);
    this.map.addLayer(this.alertRefined);
    this.map.addLayer(this.boundery);
    this.map.addLayer(this.deforestation);
    this.map.addLayer(this.notDeforestation);
    this.map.addLayer(this.referenceLayers.publishedAlerts);

    this.map.on('layeradd', (e) => {
      setTimeout(() => {
        this.imageBeforeLayer.getLayers().forEach(layer => {
          layer.setZIndex(10);
        });
        this.imageAfterLayer.getLayers().forEach(layer => {
          layer.setZIndex(10);
        });
        this.referenceLayers.publishedAlerts.setZIndex(12);
        this.alertRefined.setZIndex(11);
      }, 500);
    });
  }

  public viewAlert(alert: Alert) {

    // clear map layers
    this.imageBeforeLayer.clearLayers();
    this.imageAfterLayer.clearLayers();
    this.alertRefined.clearLayers();
    this.boundery.clearLayers();
    this.deforestation.clearLayers();
    this.notDeforestation.clearLayers();

    // open modal
    $(this.elertModalElem.nativeElement).modal();

    this.alertsService.getById(alert.id).subscribe(
      (result) => {

        this.alert = result.data;
        
        // Alert Layer
        let alertGeoJSON = L.geoJSON(this.alert.geometry.geometry, {
          style: GeometryStyles.Alert.refined
        });
        this.alertRefined.addLayer(alertGeoJSON);

        let boundery = L.geoJSON(this.alert.refinement.geometryBounds, {
          style: GeometryStyles.RefinementSamples.boundery.default
        });

        this.boundery.addLayer(boundery);

        let deforestation = L.geoJSON(this.alert.refinement.geometrySamplesDeforestation, {
          style: GeometryStyles.RefinementSamples.deforestation.default
        });
        this.deforestation.addLayer(deforestation);

        let notDeforestation = L.geoJSON(this.alert.refinement.geometrySamplesNotDeforestation, {
          style: GeometryStyles.RefinementSamples.notDeforestation.default
        });
        this.notDeforestation.addLayer(notDeforestation);

        setTimeout(() => {
          this.map.invalidateSize();
          this.map.fitBounds(L.geoJSON(this.alert.refinement.geometryRaw).getBounds());
          this.loadAlertImages();
        }, 500);

      },
      error => {

      }
    );

  }

  private loadAlertImages() {

    let imageLoadParams = {
      imagesBefore: this.alert.activation.images
        .filter(img => img.reference == 'before')
        .map(img => `${environment.geePlanetCollection}/${this.alert.id}_${img.name}`),
      imagesAfter: this.alert.activation.images
        .filter(img => img.reference == 'after')
        .map(img => `${environment.geePlanetCollection}/${this.alert.id}_${img.name}`),
      bounderyObj: turf.featureCollection([turf.envelope(turf.buffer(this.alert.activation.geometry, 0.5))])
    };

    let imageBefore: any;
    let imageAfter: any;

    this.alertRefinementGee.loadAlertImages(imageLoadParams)
      .pipe(
        finalize(() => {
          this.setAlertImages(imageBefore.mapid, imageAfter.mapid);
        })
      )
      .subscribe(
        (data: any) => {
          if (data.label == 'before') {
            imageBefore = data.result;
          }
          if (data.label == 'after') {
            imageAfter = data.result;
          }
        }
      );
  }

  private setAlertImages(imageMapIdBefore: MapId, imageMapIdAfter: MapId) {

    let alertImageBeforeLayer = new GeeMapId(imageMapIdBefore).layer;
    this.imageBeforeLayer.addLayer(alertImageBeforeLayer);

    let alertImageAfterLayer = new GeeMapId(imageMapIdAfter).layer;
    this.imageAfterLayer.addLayer(alertImageAfterLayer);

    this.initLayerControl();
  }

  private initLayerControl() {

    let baseLayers = {};

    let overlays = {
      'Published Alerts': this.referenceLayers.publishedAlerts
    };


    if (this.imageBeforeLayer.getLayers().length) {
      overlays['Before Image'] = this.imageBeforeLayer;
    }

    if (this.imageAfterLayer.getLayers().length) {
      overlays['After Image'] = this.imageAfterLayer;
    }

    if (this.alertRefined.getLayers().length) {
      overlays['Alert Refined'] = this.alertRefined;
    }

    if (this.boundery.getLayers().length) {
      overlays['Boundery'] = this.boundery;
    }

    if (this.notDeforestation.getLayers().length) {
      overlays['Non Deforestation'] = this.notDeforestation;
    }

    if (this.deforestation.getLayers().length) {
      overlays['Deforestation'] = this.deforestation;
    }

    let options = {
      collapsed: false,
      position: 'bottomright',
    };

    if (this.layersCtrl) {
      this.map.removeControl(this.layersCtrl);
    }

    this.layersCtrl = L.control.layers(baseLayers, overlays, options);

    this.map.addControl(this.layersCtrl);
  }

}
