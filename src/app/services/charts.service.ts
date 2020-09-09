import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ServiceResponse } from './service-response';


@Injectable()
export class ChartsService {

    constructor(private http: HttpClient) { }  

    /**
     * Gets chart data
     *
     * @param {string} chart
     * @param {*} [params=null]
     * @returns {Observable<ServiceResponse<any[]>>}
     * @memberof ChartsService
     */
    getData(chart: string, params: any = null): Observable<ServiceResponse<any[]>> {

        const postParams = {
            chart : chart,
            params : params
        }

        return this.http.post<ServiceResponse<any[]>>(environment.apiBaseUrl + '/api/charts/data', postParams);
    }

}