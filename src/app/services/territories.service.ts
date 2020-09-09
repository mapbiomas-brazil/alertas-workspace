import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ServiceResponse } from './service-response';
import { Territory } from '../model/territory.entity';

@Injectable()
export class TerritoriesService {

    constructor(private http: HttpClient) { }

    /**
     * Alert list
     * 
     * @param {any} [query=null] 
     * @returns 
     * @memberof TerritoriesService
     */
    list(query: any = null): Observable<ServiceResponse<Territory[]>> {

        const httpParams = new HttpParams({
            fromObject: query
        });

        return this.http.get<ServiceResponse<Territory[]>>(environment.apiBaseUrl + '/api/territories', {
            params: httpParams
        });
    }

}