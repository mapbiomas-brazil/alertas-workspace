import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ServiceResponse } from './service-response';
import { RuralProperty } from '../model/rural-property.entity';

@Injectable()
export class RuralPropertiesService {

    constructor(private http: HttpClient) { }

    /**
     * Rural Property list
     * 
     * @param {any} [query=null] 
     * @returns 
     * @memberof TerritoriesService
     */
    list(query: any = null): Observable<ServiceResponse<RuralProperty[]>> {

        const httpParams = new HttpParams({
            fromObject: query
        });

        return this.http.get<ServiceResponse<RuralProperty[]>>(environment.apiBaseUrl + '/api/rural_properties', {
            params: httpParams
        });
    }

}