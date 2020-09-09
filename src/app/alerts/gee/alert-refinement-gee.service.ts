import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { retryWhen, delay, take, switchMap } from 'rxjs/operators';

import { FeatureCollection, Geometry } from 'geojson';

import { GeeAlertRefinement } from './alert-refinement.gee.js';


@Injectable()
export class AlertRefinementGeeService {

  private geeAlertRefinement;

  private classificationParams = {
    nTrees: 20,
    nPoints: 200,
    classPoints: [100, 100],
    classValues: [1, 2],
    seed: 1.0,
    scale: 1,
    deforestationSize: 50,
    notDeforestationSize: 50
  };

  constructor(private http: HttpClient) {
    this.geeAlertRefinement = new GeeAlertRefinement();
  }

  /**
   * GEE Alert Refinement 
   *
   * @param {AlertRefinementParams} params
   * @returns {Observable<Object>}
   * @memberof AlertRefinementGeeService
   */
  refineAlert(params: AlertRefinementParams): Observable<Object> {

    const refineAlert$ = new Observable(subscriber => {
      try {
        this.geeAlertRefinement.refineAlert(params, this.classificationParams, (result, label) => {
          result.alertRefinedGeoJson = null;
          subscriber.next(result);
          subscriber.complete();
        });
      } catch (error) {
        subscriber.error(error);
      }
    }).pipe(
      switchMap((result: any) => {
        return new Observable(subscriber => {
          try {
            result.alertRefined.evaluate((featurecol) => {                            
              result.alertRefinedGeoJson = featurecol;
              subscriber.next(result);
              subscriber.complete();
            });
          } catch (error) {
            subscriber.error(error);
          }
        }).pipe(
          retryWhen(errors => errors.pipe(delay(2000), take(10)))
        );
      })
      /*
      switchMap((result: any) => {
        return new Observable(subscriber => {
          try {
            result.alertRefined.getDownloadURL('json', null, 'alertRefinement', (url) => {
              subscriber.next(url);
              subscriber.complete();
            });
          } catch (error) {
            subscriber.error(error);
          }
        }).pipe(
          switchMap((url: string) => {
            return this.http.get(url)
              .pipe(
                retry(50),
                catchError(error => { 
                  if(error == 'Error 0'){
                    throw 'Error at Export GeoJson';
                  }                  
                  return error;
                })
              );
          }),
          map((geojson) => {
            result.alertRefinedGeoJson = geojson;
            return result;
          })
        );
      }),
      */
    );
    return refineAlert$;
  }

  /**
   * Loads alert images
   *
   * @param {AlertImage} alertImageBefore
   * @param {AlertImage} alertImageAfter
   * @returns {Observable<Object>}
   * @memberof AlertRefinementGeeService
   */
  loadAlertImages(params: AlertImageLoadParams): Observable<Object> {

    const loadAlertImages$ = new Observable(subscriber => {
      try {
        let count = 0;
        this.geeAlertRefinement.getEnhancedImages(params, (result, label) => {
          count++;
          subscriber.next({ result: result, label: label });
          if (count == 2) {
            subscriber.complete();
          }
        });
      } catch (error) {
        subscriber.error(error);
      }
    }).pipe(
      retryWhen(errors => errors.pipe(delay(2000), take(10)))
    );

    return loadAlertImages$;
  }

  /**
   * Loads alert thumb url
   *   
   * @param {gee.Image} geeImage
   * @param {Geometry} region
   * @returns {Observable<string>}
   * @memberof AlertRefinementGeeService
   */
  loadAlertGeomThumbnail(geeImage: any, alertGeom: Geometry, area: Geometry): Observable<any> {

    /**
     * Calculating thmbnail region
     * 
     */

    let imageThumbRegion = turf.envelope(
      turf.buffer(
        turf.bboxPolygon(turf.bbox(area)), 0)
    ).geometry;

    /**
     * Mosaic image and alert geometry
     * 
     */
    let alertFeatureImage = ee.FeatureCollection(ee.Feature(alertGeom)).style({
      color: 'ff0000',
      fillColor: '00000000',
      width: 2
    }).select(
      ['vis-red', 'vis-green', 'vis-blue'],
      ['r', 'g', 'b']
    );

    let alertImage = ee.ImageCollection(ee.List([geeImage, alertFeatureImage])).mosaic();

    /**
     * Loads thumbnail image data
     *  
     */
    let loadAlertThumbImage$ = new Observable<any>(subscriber => {

      let thumbParams = {
        dimension: '400x400',
        region: imageThumbRegion,
        format: 'png',
        crs: 'EPSG:3857',
        scale: 5
      };

      try {
        alertImage.getThumbURL(thumbParams, (thumbUrl) => {
          subscriber.next(thumbUrl);
          subscriber.complete();
        });
      } catch (error) {
        subscriber.error(error);
      }
    }).pipe(
      retryWhen(errors => errors.pipe(delay(2000), take(10)))
    );

    loadAlertThumbImage$ = loadAlertThumbImage$.pipe(
      switchMap(url => {
        return this.http.get(url, { responseType: 'blob' }).pipe(
          retryWhen(errors => errors.pipe(delay(2000), take(10)))
        );
      }),
      switchMap(imageBlob => {
        return new Observable(subscriber => {
          let reader = new FileReader();
          reader.readAsDataURL(imageBlob);
          reader.onload = () => {
            subscriber.next({
              base64: reader.result,
              blob: imageBlob
            });
            subscriber.complete();
          };
        })
      }),
    );

    return loadAlertThumbImage$;
  }

  /**
   * Loads alert thumb url
   *   
   * @param {gee.Image} geeImage
   * @param {Geometry} region
   * @returns {Observable<string>}
   * @memberof AlertRefinementGeeService
   */
  loadAlertImageThumbnail(geeImage: any, alertImage: any, area: Geometry): Observable<any> {

    /**
     * Calculating thmbnail region
     * 
     */
    let imageThumbRegion = turf.envelope(
      turf.buffer(
        turf.bboxPolygon(turf.bbox(area)), 0)
    ).geometry;


    /**
    * Mosaic image and alert geometry
    * 
    */
    alertImage = alertImage.select(
      ['vis-red', 'vis-green', 'vis-blue'],
      ['r', 'g', 'b']
    );

    let alertThumb = ee.ImageCollection(ee.List([geeImage, alertImage])).mosaic();

    /**
     * Loads thumbnail image data
     *  
     */
    let loadAlertThumbImage$ = new Observable<any>(subscriber => {

      let thumbParams = {
        dimension: '400x400',
        region: imageThumbRegion,
        format: 'png',
        crs: 'EPSG:3857'
      };

      try {
        alertThumb.getThumbURL(thumbParams, (thumbUrl) => {
          subscriber.next(thumbUrl);
          subscriber.complete();
        });
      } catch (error) {
        subscriber.error(error);
      }
    }).pipe(
      retryWhen(errors => errors.pipe(delay(2000), take(10)))
    );

    loadAlertThumbImage$ = loadAlertThumbImage$.pipe(
      switchMap(url => {
        return this.http.get(url, { responseType: 'blob' }).pipe(
          retryWhen(errors => errors.pipe(delay(2000), take(10)))
        );
      }),
      switchMap(imageBlob => {
        return new Observable(subscriber => {
          let reader = new FileReader();
          reader.readAsDataURL(imageBlob);
          reader.onload = () => {
            subscriber.next({
              base64: reader.result,
              blob: imageBlob
            });
            subscriber.complete();
          };
        })
      }),
    );

    return loadAlertThumbImage$;
  }

}


export interface AlertRefinementParams {

  imagesBefore: string[];

  imagesAfter: string[];

  deforestationObj: FeatureCollection;

  notDeforestationObj: FeatureCollection;

  bounderyObj: FeatureCollection;

  satellite: string;
}

export interface AlertImageLoadParams {

  imagesBefore: string[];

  imagesAfter: string[];

  bounderyObj: FeatureCollection;
}
