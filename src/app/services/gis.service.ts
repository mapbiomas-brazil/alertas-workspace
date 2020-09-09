import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ServiceResponse } from './service-response';
import { Geometry } from 'geojson';


@Injectable()
export class GisService {

    constructor(private http: HttpClient) { }

    /**
     * Clear polygons and holes from a geometry multipolygon
     *
     * @param {string} chart
     * @param {*} [params=null]
     * @returns {Observable<ServiceResponse<any[]>>}
     * @memberof ChartsService
     */
    geometryCleaning(geometry: any, toleranceOut: number = 1, toleranceIn: number = 1): Observable<ServiceResponse<{geometry:Geometry}>> {

        const payload = {
            geometry: geometry,
            toleranceOut: toleranceOut,
            toleranceIn: toleranceIn
        };

        return this.http.post<ServiceResponse<{geometry:Geometry}>>(environment.apiBaseUrl + '/api/gis/geometry/cleaning', payload);
    }

}