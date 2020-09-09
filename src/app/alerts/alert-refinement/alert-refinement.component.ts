import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { forkJoin, Observable } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import * as Store from 'store';
import { FeatureCollection, Geometry } from 'geojson';

import { AlertsService } from 'src/app/services/alerts.service';
import { AlertRefinementGeeService, AlertRefinementParams, AlertImageLoadParams } from '../gee/alert-refinement-gee.service';

import { AppStorage } from 'src/app/app.storage';
import { NotificationsService } from 'src/app/core/notifications.service';
import { AuthService } from 'src/app/auth/auth.service';

import { Alert } from '../../model/alert.entity';
import { User } from 'src/app/model/user.entity';

import { AlertRefinementMapComponent } from './alert-refinement-map.component';
import { environment } from 'src/environments/environment';
import { AlertStatusList, AlertStatusRejectionReasons, AlertStatusValue } from '../alert-status';
import { SocketClientEvent } from 'src/app/socket/socket-client-event';
import { GisService } from 'src/app/services/gis.service';


@Component({
  selector: 'app-alert-refinement',
  templateUrl: './alert-refinement.component.html',
  styleUrls: ['./alert-refinement.component.scss']
})
export class AlertRefinementComponent implements OnInit, OnDestroy {

  /**
   * Authenticated user
   *
   * @type {User}
   * @memberof AlertRefinementComponent
   */
  authUser: User;

  /**
   * Local Storage
   *
   * @memberof AlertRefinementComponent
   */
  storage = Store;

  /**
   * Alerts Map component
   *
   * @type {AlertsMapComponent}
   * @memberof AlertRefinementComponent
   */
  @ViewChild('alertMap', { static: true })
  alertMap: AlertRefinementMapComponent;

  /**
   * Alert data 
   *
   * @type {Alert}
   * @memberof AlertRefinementComponent
   */
  alert: Alert;

  /**
   * Alert Refinement Data
   *
   * @type {AlertRefinementData}
   * @memberof AlertRefinementComponent
   */
  alertRefinementData: AlertRefinementData;

  alertRejectionReasons = AlertStatusRejectionReasons;

  /**
   * Alert status list
   *
   * @memberof AlertListComponent
   */
  alertStatusList = AlertStatusList;


  /**
   * Alert images gee data
   *
   * @memberof AlertRefinementComponent
   */
  alertImagesGeeData = {
    before: null,
    after: null
  };

  /**
   * Next alert to refine
   *
   * @type {Alert}
   * @memberof AlertRefinementComponent
   */
  alertNext: Alert;

  alertNextShow = false;


  /**
   * Indicate if something is processing
   *
   * @type {boolean}
   * @memberof AlertRefinementComponent
   */
  isProcessing: boolean = false;

  constructor(
    private router: Router,
    private routeActivated: ActivatedRoute,
    private authService: AuthService,
    private appStorage: AppStorage,
    private notifications: NotificationsService,
    private alertsService: AlertsService,
    private alertRefinementGee: AlertRefinementGeeService,
    private gisService: GisService
  ) { }

  ngOnInit() {

    this.authUser = this.authService.user;

    this.routeActivated.params.subscribe(params => {

      if (this.alert) {
        SocketClientEvent.ALERT_REFINEMENT_END.emit(this.alert);
      }

      if (params.id) {
        this.loadAlert(params.id);
      }

    });

    AlertRefinementMapComponent.Events.DrawnChange.subscribe(sample => {
      let features = this.alertMap.getEditableLayers();
      this.alertRefinementData.boundery = features.boundery;
      this.alertRefinementData.deforestation = features.deforestation;
      this.alertRefinementData.notDeforestation = features.notDeforestation;
      this.updateAlertCache();
    });

    AlertRefinementMapComponent.Events.DrawnAlertRefined.subscribe(layer => {
      let features = this.alertMap.getEditableLayers();
      this.alertRefinementData.alertRefinedSimplified = features.alertRefined.features[0] ? features.alertRefined : null;
      this.alertRefinementData.drawn = true;
      if (features.alertRefined.features[0]) {
        this.loadAlertImageThumbs((turf.combine(features.alertRefined) as FeatureCollection).features[0].geometry, this.alert.activation.geometry);
      }

    });

  }

  ngOnDestroy() {
    SocketClientEvent.ALERT_REFINEMENT_END.emit(this.alert);
  }

  /**
   * Loads alert data
   *    
   * @param {number} alertId
   * @memberof AlertRefinementComponent
   */
  private loadAlert(alertId: number) {

    this.isProcessing = true;

    this.alert = null;

    this.alertNext = null;
    this.alertNextShow = false;

    this.alertMap.reset();

    this.alertRefinementData = new AlertRefinementData();

    let loadingNoty = this.notifications.notify('Loading alert...', 'loading');

    this.alertsService.getById(alertId).subscribe(
      (result: any) => {

        this.isProcessing = false;

        this.alert = result.data;

        this.alertMap.setAlert(this.alert);

        if (this.alert.refinement) {
          this.alertMap.setAlertRefinement(this.alert.refinement);
        } else {
          this.loadAlertCache();
        }

        this.loadAlertCache();

        if (this.alert.activation && this.alert.activation.images.length > 0) {
          this.loadAlertImages();
        }

        loadingNoty.close(null, 'success');

        this.loadNextAlert();

        SocketClientEvent.ALERT_REFINEMENT_START.emit(this.alert);
      },
      error => {
        this.isProcessing = false;
        loadingNoty.close("Error at loading alert data.", 'warning');
      }
    );
  }

  /**
   * Loads alert images
   *
   * @param {Alert} alert
   * @memberof AlertRefinementComponent
   */
  private loadAlertImages() {

    this.isProcessing = true;

    let imageLoadParams: AlertImageLoadParams = {
      imagesBefore: this.alert.activation.images
        .filter(img => img.reference == 'before')
        .map(img => `${environment.geePlanetCollection}/${this.alert.id}_${img.name}`),
      imagesAfter: this.alert.activation.images
        .filter(img => img.reference == 'after')
        .map(img => `${environment.geePlanetCollection}/${this.alert.id}_${img.name}`),
      bounderyObj: turf.featureCollection([turf.envelope(turf.buffer(this.alert.activation.geometry, 0.5))])
    };

    let loadingNoty = this.notifications.notify('Loading alert images.', 'loading');

    this.alertRefinementGee.loadAlertImages(imageLoadParams)
      .pipe(
        finalize(() => {
          this.isProcessing = false;
          loadingNoty.close(null, 'success');
          this.alertMap.setAlertImages(this.alertImagesGeeData.before.mapid, this.alertImagesGeeData.after.mapid);
          this.loadAlertImageThumbs(this.alert.geometry.geometry, this.alert.activation.geometry);
        })
      )
      .subscribe(
        (data: any) => {
          this.alertImagesGeeData[data.label] = data.result;
        },
        error => {
          this.isProcessing = false;
          loadingNoty.close("Error at loading alert images.", 'warning');
        }
      );
  }

  /**
   * Loads the alert images thumbs
   *
   * @private
   * @memberof AlertRefinementComponent
   */
  private loadAlertImageThumbs(alertGeometry: Geometry, area: Geometry) {

    this.isProcessing = true;
    let loadingNoty = this.notifications.notify('Loading alert thumbnails', 'loading');
    forkJoin([
      this.alertRefinementGee.loadAlertGeomThumbnail(this.alertImagesGeeData.before.image, alertGeometry, area),
      this.alertRefinementGee.loadAlertGeomThumbnail(this.alertImagesGeeData.after.image, alertGeometry, area)
    ]).subscribe(
      result => {
        this.alertRefinementData.imageBeforeThumbnail = result[0];
        this.alertRefinementData.imageAfterThumbnail = result[1];
        this.isProcessing = false;
        loadingNoty.close(null, 'success');
      },
      error => {
        this.isProcessing = false;
        loadingNoty.close(null, 'warning');
      }
    );
  }

  /**
   * Updates alert refinement data
   *
   * @private
   * @memberof AlertRefinementComponent
   */
  private updateAlertCache() {
    this.storage.set('alertRefinement', {
      id: this.alert.id,
      samples: {
        boundery: this.alertRefinementData.boundery,
        deforestation: this.alertRefinementData.deforestation,
        notDeforestation: this.alertRefinementData.notDeforestation
      }
    });
  }

  /**
   * Loads alert refinement data
   *
   * @private
   * @memberof AlertRefinementComponent
   */
  private loadAlertCache() {
    let alertCache = this.storage.get('alertRefinement');
    if (alertCache && alertCache.id == this.alert.id && alertCache.samples) {
      this.alertMap.setSampleFeatures(alertCache.samples);
    }
  }


  /**
   * Enable draw control to set alert Envelope polygons
   *
   * @memberof AlertRefinementComponent
   */
  drawBounderyPolygons() {
    this.alertMap.activeDrawBoundery(this.alert);
  }

  /**
   * Enable draw control to set notDeforestation polygons
   *
   * @memberof AlertRefinementComponent
   */
  drawNotDeforestationPolygons() {
    this.alertMap.activeDrawNotDeforestation();
  }

  /**
   * Enable draw control to set deforestation polygons
   *
   * @memberof AlertRefinementComponent
   */
  drawDeforestationPolygons() {
    this.alertMap.activeDrawDeforestation();
  }

  /**
   * Enable draw control to set deforestation polygons
   *
   * @memberof AlertRefinementComponent
   */
  drawAlertRefined() {
    this.alertMap.activeDrawAlertRefined();
  }

  /**
   * Process refinement scripts
   *
   * @memberof AlertRefinementComponent
   */
  classify() {

    this.isProcessing = true;

    let sampleFeatures = this.alertMap.getEditableLayers();

    let refinementParams: AlertRefinementParams = {
      bounderyObj: sampleFeatures.boundery,
      deforestationObj: sampleFeatures.deforestation,
      notDeforestationObj: sampleFeatures.notDeforestation,
      imagesBefore: this.alert.activation.images
        .filter(img => img.reference == 'before')
        .map(img => `${environment.geePlanetCollection}/${this.alert.id}_${img.name}`),
      imagesAfter: this.alert.activation.images
        .filter(img => img.reference == 'after')
        .map(img => `${environment.geePlanetCollection}/${this.alert.id}_${img.name}`),
      satellite: 'planet',
    };

    let loadingNoty = this.notifications.notify('Processing alert refinement.', 'loading');

    this.alertRefinementGee.refineAlert(refinementParams).subscribe(
      (result: any) => {
        this.isProcessing = false;
        this.alertMap.setAlertRefined(result.alertRefinedGeoJson);
        this.alertRefinementData.alertRefined = result.alertRefinedGeoJson;
        this.alertRefinementData.alertRefinedCleaned = result.alertRefinedGeoJson;
        this.alertRefinementData.alertRefinedSimplified = result.alertRefinedGeoJson;
        this.loadAlertImageThumbs(this.alertRefinementData.alertRefined.features[0].geometry, this.alert.activation.geometry);
        loadingNoty.close(null, 'success');

        this.alertRefinementData.simplification = 0;
      },
      (error) => {
        this.isProcessing = false;
        loadingNoty.close("Error at processing alert geometry. Try again.", 'warning');
      }
    );
  }

  thumbs = null;

  alertRefinementCleaningChange(value: number) {

    if (this.thumbs) {
      clearTimeout(this.thumbs);
      this.thumbs = null;
    }

    this.thumbs = setTimeout(() => {

      let alertRefined = this.alertRefinementData.alertRefined.features[0].geometry;

      this.isProcessing = true;

      this.gisService.geometryCleaning(alertRefined, (parseFloat(value.toString())), (parseFloat(value.toString()))).subscribe(result => {

        let alertRefinedCleaned = result.data.geometry;

        this.alertMap.setAlertRefined(alertRefinedCleaned);

        this.alertRefinementData.alertRefinedCleaned = turf.featureCollection([
          turf.feature(alertRefinedCleaned)
        ]);

        this.alertRefinementData.alertRefinedSimplified = turf.featureCollection([
          turf.feature(alertRefinedCleaned)
        ]);

        this.isProcessing = false;

        this.alertRefinementSimplicationChange(this.alertRefinementData.simplification);

      });
    }, 1000);

  }

  alertRefinementSimplicationChange(value: number) {

    let alertRefined = this.alertRefinementData.alertRefinedCleaned.features[0].geometry;

    let alertRefinedSimplified = turf.simplify(alertRefined, { tolerance: value, highQuality: true });

    this.alertMap.setAlertRefined(alertRefinedSimplified);

    this.alertRefinementData.alertRefinedSimplified = turf.featureCollection([
      turf.feature(alertRefinedSimplified)
    ]);

    if (this.thumbs) {
      clearTimeout(this.thumbs);
      this.thumbs = null;
    }

    this.thumbs = setTimeout(() => {
      this.loadAlertImageThumbs(alertRefinedSimplified, this.alert.activation.geometry);
    }, 1000);

  }



  /**
    * Save alert refinement dara
    *
    * @memberof AlertRefinementComponent
    */
  saveAlertRefinement() {

    this.isProcessing = true;

    let alertRefinamentData = this.alertRefinementData;

    let refinementPayload: any;

    let imageBeforeFile = new File([alertRefinamentData.imageBeforeThumbnail.blob], `${this.alert.id}_before.png`);
    let imageAfterFile = new File([alertRefinamentData.imageAfterThumbnail.blob], `${this.alert.id}_after.png`);

    refinementPayload = {
      geometryBounds: alertRefinamentData.boundery.features.length > 0 ?
        (turf.combine(alertRefinamentData.boundery) as FeatureCollection).features[0].geometry : null,
      geometrySamplesDeforestation: alertRefinamentData.deforestation.features.length > 0 ?
        (turf.combine(alertRefinamentData.deforestation) as FeatureCollection).features[0].geometry : null,
      geometrySamplesNotDeforestation: alertRefinamentData.notDeforestation.features.length > 0 ?
        (turf.combine(alertRefinamentData.notDeforestation) as FeatureCollection).features[0].geometry : null,
      geometryRefined: alertRefinamentData.alertRefined ? (
        turf.combine(alertRefinamentData.alertRefined) as FeatureCollection).features[0].geometry : null,
      geometryRefinedSimplified: alertRefinamentData.alertRefinedSimplified.features.length > 0 ?
        (turf.combine(alertRefinamentData.alertRefinedSimplified) as FeatureCollection).features[0].geometry : null,
      simplificationValue: alertRefinamentData.simplification,
      userId: this.authUser.id,
      alertId: this.alert.id,
      drawn: this.alertRefinementData.drawn
    };

    if (!this.alertRefinementData.alertRefined) {
      refinementPayload.geometryRefined = refinementPayload.geometryRefinedSimplified;
      delete refinementPayload.boundery;
      delete refinementPayload.deforestation;
      delete refinementPayload.notDeforestation;
    }

    refinementPayload.boundery == null ? (delete refinementPayload.boundery) : null;
    refinementPayload.deforestation == null ? (delete refinementPayload.deforestation) : null;
    refinementPayload.notDeforestation == null ? (delete refinementPayload.notDeforestation) : null;


    let loadingNoty = this.notifications.notify('Saving alert refinement.', 'loading');

    this.alertsService.saveRefinement(refinementPayload).subscribe(
      result => {
        this.isProcessing = false;
        loadingNoty.close(null, 'success');
        this.alertNextShow = true;
      },
      error => {
        this.isProcessing = false;
        loadingNoty.close("Error at saving alert refinement. Try again.", 'warning');
      }
    );
  }

  /**
   * Reject alert
   *
   * @memberof AlertRefinementComponent
   */
  rejectAlertRefinement(reasonId: number) {

    this.isProcessing = true;

    let loadingNoty = this.notifications.notify('Processing...', 'loading');

    let rejectData = {
      userId: this.authUser.id,
      alertId: this.alert.id,
      reasonId: reasonId
    };

    this.alertsService.rejectRefinement(rejectData).subscribe(
      result => {
        this.isProcessing = false;
        this.alertNextShow = true;
        loadingNoty.close(null, 'success');
      },
      error => {
        this.isProcessing = false;
        loadingNoty.close("Error at saving alert refinement. Try again.", 'warning');
      }
    );
  }

  /**
   * Load next alert
   *
   * @private
   * @memberof AlertRefinementComponent
   */
  private loadNextAlert() {

    this.isProcessing = true;

    let storageFilter = this.appStorage.get('alertFilter');

    let nextData = {
      userId: this.authUser.id,
      teamId: storageFilter.teamId,
      alertId: this.alert.id
    };
    if (storageFilter.territory) {
      nextData['territoryId'] = storageFilter.territory.id;
    }

    this.alertsService.getNextRefine(nextData).subscribe(
      result => {
        this.isProcessing = false;
        this.alertNext = result.data;
      },
      error => {
        this.isProcessing = false;
      }
    );
  }

  /**
   * Redirect to alert refinement
   *
   * @memberof AlertRefinementComponent
   */
  refineAlertNext() {
    this.router.navigate(['/alerts/refinement', this.alertNext.id]);
  }

  validateAlertRefinementData() {

    let validation = true;

    if (!this.alertRefinementData.alertRefinedSimplified) {
      validation = false;
    }

    return validation;
  }
}


export class AlertRefinementData {

  boundery?: FeatureCollection = null;

  deforestation?: FeatureCollection = null;

  notDeforestation?: FeatureCollection = null;

  alertRefined?: FeatureCollection = null;

  alertRefinedCleaned?: FeatureCollection = null;

  alertRefinedSimplified?: FeatureCollection = null;

  simplification: number = 0;

  cleaning: number = 0;

  drawn = false;

  imageBeforeThumbnail: {
    base64: string,
    blob: Blob
  };

  imageAfterThumbnail: {
    base64: string,
    blob: Blob
  };
}