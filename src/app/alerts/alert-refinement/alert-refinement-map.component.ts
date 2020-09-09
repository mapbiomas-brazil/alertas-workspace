import { Component, OnInit, ViewChild, ElementRef, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FeatureCollection, Polygon, MultiPolygon } from 'geojson';

import { GeometryStyles } from 'src/app/config/geometry-styles';
import { BaseMaps } from 'src/app/map/basemaps';

import { GeeMapId, MapId } from '../gee/gee-mapid';
import { Alert } from 'src/app/model/alert.entity';
import { environment } from 'src/environments/environment';
import { AlertRefinement } from 'src/app/model/alert-refinement.entity';
import { AlertStatusValue } from '../alert-status';


@Component({
  selector: 'app-alert-refinement-map',
  template: `
  <div #map style="height: 100%;width=:100%"></div>
  <ng-content></ng-content>
  `,
})
export class AlertRefinementMapComponent implements OnInit, OnDestroy {

  static Events = {
    DrawnCreated: new EventEmitter(),
    DrawnEdited: new EventEmitter(),
    DrawnDeleted: new EventEmitter(),
    DrawnChange: new EventEmitter(),
    DrawnAlertRefined: new EventEmitter()
  };


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
   * @type {L.Map}
   * @memberof AlertsMapComponent
   */
  map: any;

  /**
   * Alert Layer
   *
   * @type {L.LayerGroup}
   * @memberof AlertItemPreviewComponent
   */
  alertLayer: any = L.layerGroup();

  /**
   * Image before layer
   *
   * @type {L.LayerGroup}
   * @memberof AlertRefinementMapComponent
   */
  imageBeforeLayer: any = L.layerGroup();

  /**
   * Image after layer
   *
   * @type {L.LayerGroup}
   * @memberof AlertRefinementMapComponent
   */
  imageAfterLayer: any = L.layerGroup();

  /**
   * Editable Layers
   *
   * @type {*}
   * @memberof AlertRefinementMapComponent
   */
  editableLayers = {
    boundery: L.featureGroup(),
    deforestation: L.featureGroup(),
    notDeforestation: L.featureGroup(),
    alertRefined: L.featureGroup()
  };

  /**
   * Drawing Control
   *
   * @type {L.Control.Draw}
   * @memberof AlertsMapComponent
   */
  drawControl: any;

  /**
   * Draw default options
   *
   * @memberof AlertRefinementMapComponent
   */
  drawDefaultOpts = {
    position: 'topright',
    edit: {
      featureGroup: null,
      poly: {
        allowIntersection: false
      }
    },
    draw: {
      polygon: {
        allowIntersection: false,
        showArea: true,
        repeatMode: true
      },
      rectangle: {
        showArea: true,
        repeatMode: true
      },
      circle: false,
      polyline: false,
      marker: false,
      circlemarker: false
    }
  };

  /**
   * SideBySide Control layers
   *
   * @memberof AlertRefinementMapComponent
   */
  imageBeforeAfterCtrl;

  /**
   * leaflet layer control
   *
   * @memberof AlertRefinementMapComponent
   */
  layersCtrl;

  /**
   * Draw target sample layer
   *
   * @memberof AlertRefinementMapComponent
   */
  drawFocus: any;

  /**
   * Sample target label
   *
   * @type {string}
   * @memberof AlertRefinementMapComponent
   */
  sampleFocus: string;

  /**
   * Draw sub
   *
   * @memberof AlertRefinementMapComponent
   */
  drawnSubscription: Subscription;

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
      maxZoom: 18,
      zoomControl: false
    });

    L.control.zoom({ position: 'topleft' }).addTo(this.map);

    L.control.scale({ position: 'bottomright' }).addTo(this.map);

    // Default Base Layer
    this.map.addLayer(this.referenceLayers.osm);

    // Init Layers
    this.initLayers();

    // Init Layers control
    this.initLayerControl();

    // Init Events
    this.initEvents();

  }

  ngOnDestroy() {
    if (this.drawnSubscription) {
      this.drawnSubscription.unsubscribe();
    }
    document.onkeyup = null;
  }


  /**
   * Init default layers
   *
   * @memberof AlertRefinementMapComponent
   */
  initLayers() {

    Object.keys(this.editableLayers).forEach(sampleLayerKey => {
      this.map.addLayer(this.editableLayers[sampleLayerKey]);
    });

    this.map.addLayer(this.alertLayer);
    this.map.addLayer(this.imageBeforeLayer);
    this.map.addLayer(this.imageAfterLayer);
    this.map.addLayer(this.referenceLayers.publishedAlerts);
  }


  /**
   * Inits layers control
   *
   * @memberof AlertRefinementMapComponent
   */
  initLayerControl() {

    let baseLayers = {
      "Open Street Maps": this.referenceLayers.osm,
      "Google Satellite": this.referenceLayers.google,
      //"Bing Satellite": this.bingBaseLayer
    };

    let groupedOverlays = {
      'Published Alerts': this.referenceLayers.publishedAlerts
    };

    if (this.alertLayer.getLayers().length) {
      groupedOverlays['Alert'] = this.alertLayer;
    }

    if (this.imageBeforeLayer.getLayers().length) {
      groupedOverlays['Alert Image Before'] = this.imageBeforeLayer;
    }

    if (this.imageAfterLayer.getLayers().length) {
      groupedOverlays['Alert Image After'] = this.imageAfterLayer;
    }

    if (this.editableLayers.boundery.getLayers().length) {
      groupedOverlays['Boundery'] = this.editableLayers.boundery;
    }

    if (this.editableLayers.notDeforestation.getLayers().length) {
      groupedOverlays['Non Deforestation'] = this.editableLayers.notDeforestation;
    }

    if (this.editableLayers.deforestation.getLayers().length) {
      groupedOverlays['Deforestation'] = this.editableLayers.deforestation;
    }

    if (this.editableLayers.alertRefined.getLayers().length) {
      groupedOverlays['Refined Alert'] = this.editableLayers.alertRefined;
    }

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

    /**
     * Drawn Event
     */
    this.map.on('draw:created', (e) => {
      let layer = e.layer;
      AlertRefinementMapComponent.Events.DrawnCreated.emit(layer);
      AlertRefinementMapComponent.Events.DrawnChange.emit(layer);
      this.initLayerControl();
    });
    this.map.on('draw:edited', (e) => {
      let layers = e.layers;
      AlertRefinementMapComponent.Events.DrawnEdited.emit(layers);
      AlertRefinementMapComponent.Events.DrawnChange.emit();
      this.initLayerControl();
    });
    this.map.on('draw:deleted', (e) => {
      let layers = e.layers;
      AlertRefinementMapComponent.Events.DrawnDeleted.emit(layers);
      AlertRefinementMapComponent.Events.DrawnChange.emit();
      this.initLayerControl();
    });

    /**
     * Shortcuts SideBySide Layer Control  
     */
    document.onkeyup = (e) => {
      if (this.imageBeforeAfterCtrl && e.ctrlKey && e.key == 'ArrowLeft') {
        this.imageBeforeAfterCtrl.setPosition(0.02);
      }
      if (this.imageBeforeAfterCtrl && e.ctrlKey && e.key == 'ArrowRight') {
        this.imageBeforeAfterCtrl.setPosition(0.98);
      }
    };

    this.map.on('layeradd', (e) => {
      setTimeout(() => {
        this.imageBeforeLayer.getLayers().forEach(layer => {
          layer.setZIndex(10);
        });
        this.imageAfterLayer.getLayers().forEach(layer => {
          layer.setZIndex(10);
        });
        this.referenceLayers.publishedAlerts.setZIndex(11);
      }, 500);
    });

  }

  /**
   * Sets alert on maps
   *
   * @param {Alert} alert
   * @memberof AlertRefinementMapComponent
   */
  setAlert(alert: Alert) {

    this.alertLayer.clearLayers();

    let alertGeoJSON = L.geoJSON(alert.originalGeometry.geometry, {
      style: GeometryStyles.Alert.default
    });

    this.alertLayer.addLayer(alertGeoJSON);

    this.map.fitBounds(alertGeoJSON.getBounds());
  }

  /**
   * Sets alert on maps
   *
   * @param {AlertRefinement} alert
   * @memberof AlertRefinementMapComponent
   */
  setAlertRefinement(alertRefinement: AlertRefinement) {

    const boundery = alertRefinement.geometryBounds ? turf.featureCollection([turf.polygon((<Polygon>alertRefinement.geometryBounds).coordinates)]) : null;

    const deforestation = alertRefinement.geometrySamplesDeforestation ? turf.featureCollection((<MultiPolygon>alertRefinement.geometrySamplesDeforestation)
      .coordinates
      .filter(coord => coord[0].length > 3)
      .map(coord => {
        return turf.polygon(coord);
      })) : null;

    const notDeforestation = alertRefinement.geometrySamplesNotDeforestation ? turf.featureCollection((<MultiPolygon>alertRefinement.geometrySamplesNotDeforestation)
      .coordinates
      .filter(coord => coord[0].length > 3)
      .map(coord => {
        return turf.polygon(coord);
      })) : null;

    const alertRefinedSimplified = alertRefinement.geometryRaw ? turf.featureCollection((<MultiPolygon>alertRefinement.geometryRaw)
      .coordinates
      .filter(coord => coord[0].length > 3)
      .map(coord => {
        return turf.polygon(coord);
      })) : null;

    this.setSampleFeatures({
      boundery: boundery,
      deforestation: deforestation,
      notDeforestation: notDeforestation
    });

    this.setAlertRefined(alertRefinedSimplified);

  }

  /**
   * Sets alert image mapIds
   *
   * @param {MapId} imageMapIdBefore
   * @param {MapId} imageMapIdAfter
   * @memberof AlertRefinementMapComponent
   */
  setAlertImages(imageMapIdBefore: MapId, imageMapIdAfter: MapId) {

    let alertImageBeforeLayer = new GeeMapId(imageMapIdBefore).layer;
    this.imageBeforeLayer.clearLayers();
    this.imageBeforeLayer.addLayer(alertImageBeforeLayer);

    let alertImageAfterLayer = new GeeMapId(imageMapIdAfter).layer;
    this.imageAfterLayer.clearLayers();
    this.imageAfterLayer.addLayer(alertImageAfterLayer);

    if (this.imageBeforeAfterCtrl) {
      this.map.removeControl(this.imageBeforeAfterCtrl);
    }

    this.imageBeforeAfterCtrl = L.control.sideBySide(this.imageBeforeLayer.getLayers()[0], this.imageAfterLayer.getLayers()[0]);

    this.map.addControl(this.imageBeforeAfterCtrl);

    this.imageBeforeAfterCtrl.setPosition(0.02);

    this.initLayerControl();
  }

  /**
   * Sets alert refined image mapid
   *
   * @param {MapId} mapid
   * @memberof AlertRefinementMapComponent
   */
  setAlertRefined(alertFeatures: any) {

    this.editableLayers.alertRefined.clearLayers();

    if (alertFeatures.type == 'FeatureCollection' && alertFeatures.features[0].geometry.type == 'MultiPolygon') {
      alertFeatures.features[0].geometry.coordinates.forEach(coord => {
        L.geoJSON(turf.polygon(coord), {
          style: GeometryStyles.Alert.refined
        }).getLayers().forEach(layer => {
          this.editableLayers.alertRefined.addLayer(layer);
        });
      });
    } else if (alertFeatures.type == 'MultiPolygon') {
      alertFeatures.coordinates.forEach(coord => {
        L.geoJSON(turf.polygon(coord), {
          style: GeometryStyles.Alert.refined
        }).getLayers().forEach(layer => {
          this.editableLayers.alertRefined.addLayer(layer);
        });
      })
    } else {
      L.geoJSON(alertFeatures, {
        style: GeometryStyles.Alert.refined
      }).getLayers().forEach(layer => {
        this.editableLayers.alertRefined.addLayer(layer);
      });
    }
    this.initLayerControl();
  }

  /**
   * Gets samples geojson features
   *
   * @returns
   * @memberof AlertRefinementMapComponent
   */
  getEditableLayers() {

    const editables = {
      boundery: this.editableLayers.boundery.toGeoJSON(),
      deforestation: this.editableLayers.deforestation.toGeoJSON(),
      notDeforestation: this.editableLayers.notDeforestation.toGeoJSON(),
      alertRefined: this.editableLayers.alertRefined.toGeoJSON(),
    };

    return editables;
  }

  /**
   * Sets samples geojson features
   *
   * @memberof AlertRefinementMapComponent
   */
  setSampleFeatures(samples: any) {

    this.editableLayers.boundery.clearLayers();
    this.editableLayers.deforestation.clearLayers();
    this.editableLayers.notDeforestation.clearLayers();

    if (samples.boundery) {
      L.geoJSON(samples.boundery).getLayers().forEach(layer => {
        this.editableLayers.boundery.addLayer(layer);
      });
      this.editableLayers.boundery.setStyle(GeometryStyles.RefinementSamples.boundery.default);
    }
    if (samples.deforestation) {
      L.geoJSON(samples.deforestation).getLayers().forEach(layer => {
        this.editableLayers.deforestation.addLayer(layer);
      });
      this.editableLayers.deforestation.setStyle(GeometryStyles.RefinementSamples.deforestation.default);
    }
    if (samples.notDeforestation) {
      L.geoJSON(samples.notDeforestation).getLayers().forEach(layer => {
        this.editableLayers.notDeforestation.addLayer(layer);
      });
      this.editableLayers.notDeforestation.setStyle(GeometryStyles.RefinementSamples.notDeforestation.default);
    }

    AlertRefinementMapComponent.Events.DrawnChange.emit();

    this.initLayerControl();

  }

  /**
   * Enable draw control
   *
   * @memberof AlertsMapComponent
   */
  private activeDrawControl(sampleName: string) {

    if (this.sampleFocus === sampleName) {
      this.map.removeControl(this.drawControl);
      this.drawControl = null;
      this.drawFocus = null;
      this.sampleFocus = null;
      return;
    }

    this.sampleFocus = sampleName;

    if (this.drawControl) {
      this.map.removeControl(this.drawControl);
    };

    let drawOptions = Object.assign({}, this.drawDefaultOpts);

    drawOptions.edit.featureGroup = this.editableLayers[sampleName];

    this.drawControl = new L.Control.Draw(drawOptions);

    this.map.addControl(this.drawControl);
  }

  /**
   * Enable draw control to Alert Envelope
   *
   * @memberof AlertsMapComponent
   */
  activeDrawBoundery(alert: Alert) {

    if (this.drawnSubscription) {
      this.drawnSubscription.unsubscribe();
      this.drawnSubscription = null;
    }

    this.drawnSubscription = AlertRefinementMapComponent.Events.DrawnCreated.subscribe(
      layerDrawn => {
        this.editableLayers.boundery.clearLayers();
        this.editableLayers.boundery.addLayer(layerDrawn);
        this.editableLayers.boundery.setStyle(GeometryStyles.RefinementSamples.boundery.default);
      }
    );

    if (this.editableLayers.boundery.getLayers().length == 0) {
      let bounderyGeometry = turf.simplify(
        turf.buffer(alert.geometry.geometry, 0.1),
        { tolerance: 0.001, highQuality: true }
      ).geometry;

      let bounderyLayer = L.geoJSON(bounderyGeometry, {
        style: GeometryStyles.RefinementSamples.boundery.default
      }).getLayers()[0];

      this.editableLayers.boundery.addLayer(bounderyLayer);
      AlertRefinementMapComponent.Events.DrawnChange.emit();
      this.initLayerControl();
    }

    this.activeDrawControl('boundery');
  }

  /**
   * Enable draw control to Non Deforestation
   *
   * @memberof AlertsMapComponent
   */
  activeDrawNotDeforestation() {

    if (this.drawnSubscription) {
      this.drawnSubscription.unsubscribe();
      this.drawnSubscription = null;
    }

    this.drawnSubscription = AlertRefinementMapComponent.Events.DrawnCreated.subscribe(
      layerDrawn => {
        this.editableLayers.notDeforestation.addLayer(layerDrawn);
        this.editableLayers.notDeforestation.setStyle(GeometryStyles.RefinementSamples.notDeforestation.default);
      }
    );

    this.activeDrawControl('notDeforestation');
  }

  /**
   * Enable draw control to Deforestation
   *
   * @memberof AlertsMapComponent
   */
  activeDrawDeforestation() {

    if (this.drawnSubscription) {
      this.drawnSubscription.unsubscribe();
      this.drawnSubscription = null;
    }

    this.drawnSubscription = AlertRefinementMapComponent.Events.DrawnCreated.subscribe(
      layerDrawn => {
        this.editableLayers.deforestation.addLayer(layerDrawn);
        this.editableLayers.deforestation.setStyle(GeometryStyles.RefinementSamples.deforestation.default);
      }
    );

    this.activeDrawControl('deforestation');
  }

  /**
   * Enable draw control to Alert Refined
   *
   * @memberof AlertsMapComponent
   */
  activeDrawAlertRefined() {

    if (this.drawnSubscription) {
      this.drawnSubscription.unsubscribe();
      this.drawnSubscription = null;
    }

    this.drawnSubscription = AlertRefinementMapComponent.Events.DrawnChange.subscribe(
      layerDrawn => {
        if (layerDrawn) {
          this.editableLayers.alertRefined.addLayer(layerDrawn);
          this.editableLayers.alertRefined.setStyle(GeometryStyles.Alert.refined);
        }
        AlertRefinementMapComponent.Events.DrawnAlertRefined.emit();
      }
    );

    this.activeDrawControl('alertRefined');
  }

  /**
   * Reset map state
   *
   * @memberof AlertRefinementMapComponent
   */
  reset() {
    if (this.editableLayers.boundery) {
      this.editableLayers.boundery.clearLayers();
    }
    if (this.editableLayers.deforestation) {
      this.editableLayers.deforestation.clearLayers();
    }
    if (this.editableLayers.notDeforestation) {
      this.editableLayers.notDeforestation.clearLayers();
    }
    if (this.editableLayers.alertRefined) {
      this.editableLayers.alertRefined.clearLayers();
    }
    this.alertLayer.clearLayers();
    this.imageBeforeLayer.clearLayers();
    this.imageAfterLayer.clearLayers();
    setTimeout(() => {
      this.initLayerControl();
    }, 500);
  }

}
