import { EventEmitter } from '@angular/core';

import { Observable } from 'rxjs';
import { delay, take, retryWhen, tap } from 'rxjs/operators';

import Moment from 'src/lib/moment';
import { Geometry, Polygon } from 'geojson';
import { MapId } from './gee-mapid';



export class GeeMosaic {

    Events = {
        Processed: new EventEmitter()
    };

    /**
     * GEE Image object
     *
     * @type {*}
     * @memberof GeeImage
     */
    image: any = {};

    /**
     * GEE Image mapid object
     *
     * @type {*}
     * @memberof GeeImage
     */
    mapid: MapId;

    /**
     * Gee Image data parameters 
     *
     * @type {*}
     * @memberof GeeImage
     */
    params: any;


    /**
     * Leaflet TileLayer
     *
     * @type {TileLayer}
     * @memberof GeeImage
     */
    layer: any;

    constructor(params: GeeMoisacParams = null) {
        this.params = params;
    }

    /**
     * Run GEE Script using Observable Class
     *
     * @param {*} params
     * @returns this.mapid{Observable<any>}
     * @memberof GeeImage
     */
    process(params: GeeMoisacParams = null): Observable<any> {

        if (params) {
            this.params = params;
        }

        const runScript$ = new Observable(subscriber => {
            try {
                this.script(this.params,
                    (result) => {
                        
                        this.mapid = result.mapid;
                        this.image = result.image;
                        this.updateLayer();

                        subscriber.next(result);
                        subscriber.complete();
                        this.Events.Processed.emit(result);
                    }
                );
            } catch (error) {
                subscriber.error(error);
            }
        }).pipe(
            retryWhen(errors => errors.pipe(delay(2000), take(10)))
        );

        return runScript$;
    }

    /**
     * Run GEE Script using callback function
     *
     * @param {*} params
     * @param {Function} done
     * @memberof GeeImage
     */
    private script(params: GeeMoisacParams, done: Function) {

        let visParams = {
            bands: params.bands,
            min: 0,
            max: 3000,
            gamma: 1.4,
        };

        let dataset = ee.ImageCollection(params.imageCollectionPath)
            .filterDate(params.dateStart, params.dateEnd)
            .filterMetadata("CLOUD_COVER", "less_than", params.cloudCover);

        let image = dataset.median().clip(params.geometry);

        image.getMap(visParams, (mapid) => {
            done({
                image: image,
                mapid: mapid
            });
        });
    }

    /**
     * Gets the GEE Image tile url 
     *
     * @returns {string}
     * @memberof GeeImage
     */
    private updateLayer() {

        let url = `https://earthengine.googleapis.com/map/${this.mapid.mapid}/{z}/{x}/{y}?token=${this.mapid.token}`;

        if (!this.layer) {
            this.layer = L.tileLayer(url, {
                attribution: "Google Earth Engine"
            });

        } else {
            this.layer.setUrl(url);
            this.layer.redraw();
        }
    }

}



export class GeeMoisacParams {

    /**
     * Image collection path
     *
     * @type {string}
     * @memberof GeeImageParams
     */
    imageCollectionPath: string;

    /**
     * Image bands
     *
     * @type {string}
     * @memberof GeeImageParams
     */
    bands: string[] = [];

    /**
     * Image cloud 
     *
     * @type {Number}
     * @memberof GeeImageParams
     */
    cloudCover: Number = 30;

    /**
     *  Date start
     *
     * @type {String}
     * @memberof GeeImageParams
     */
    dateStart: String;

    /**
     *  Date end
     *
     * @type {String}
     * @memberof GeeImageParams
     */
    dateEnd: String;

    /**
     * Geometry of target area
     *
     * @type {*}
     * @memberof GeeImageParams
     */
    geometry: Geometry;

}