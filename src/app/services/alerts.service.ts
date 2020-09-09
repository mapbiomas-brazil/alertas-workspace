import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { Alert } from '../model/alert.entity';
import { AlertRefinement } from '../model/alert-refinement.entity';

import { ServiceResponse } from './service-response';

@Injectable()
export class AlertsService {

    constructor(
        private http: HttpClient
    ) {

    }

    /**
     * Alert list
     * 
     * @param {any} [query=null] 
     * @returns 
     * @memberof AlertsService
     */
    list(query: any = null): Observable<ServiceResponse<Alert[]>> {

        const httpParams = new HttpParams({
            fromObject: query
        });

        return this.http.get<ServiceResponse<Alert[]>>(environment.apiBaseUrl + '/api/alerts', {
            params: httpParams
        });
    }

    /**
     * Alert list
     * 
     * @param {any} [query=null] 
     * @returns 
     * @memberof AlertsService
     */
    listAlertSources(): Observable<ServiceResponse<string[]>> {
        return this.http.get<ServiceResponse<string[]>>(environment.apiBaseUrl + '/api/alerts/sources');
    }

    /**
     * Gets a alert by ID
     * 
     * @param {any} [query=null] 
     * @returns 
     * @memberof AlertsService
     */
    getById(alertId: number): Observable<ServiceResponse<Alert>> {
        return this.http.get<ServiceResponse<Alert>>(`${environment.apiBaseUrl}/api/alerts/${alertId}`);
    }

    /**
     * Gets next alert to refine
     * 
     * @param {any} [query=null] 
     * @returns 
     * @memberof AlertsService
     */
    getNextRefine(query: { alertId: number, userId: number, teamId: number } = null): Observable<ServiceResponse<Alert>> {

        const httpParams = new HttpParams({
            fromObject: (query as any)
        });

        return this.http.get<ServiceResponse<Alert>>(environment.apiBaseUrl + '/api/alerts/refinement/next', {
            params: httpParams
        });
    }

    /**
     * Save Alert Refinement data
     *
     * @param {AlertRefinementData} alertRefinement
     * @returns {Observable<ServiceResponse<AlertRefinementData>>}
     * @memberof AlertsService
     */
    uploadRefinedThumbnail(file: File): Observable<ServiceResponse<any>> {

        let formData = new FormData();

        formData.append('file', file);

        return this.http.post<ServiceResponse<any>>(environment.apiBaseUrl + '/api/alerts/refined/thumbnail', formData);
    }

    /**
     * Save Alert Refinement data
     *
     * @param {AlertRefinementData} alertRefinement
     * @returns {Observable<ServiceResponse<AlertRefinementData>>}
     * @memberof AlertsService
     */
    saveRefinement(alertRefinement: any): Observable<ServiceResponse<AlertRefinement>> {
        return this.http.post<ServiceResponse<AlertRefinement>>(environment.apiBaseUrl + '/api/alerts/refinement', alertRefinement);
    }

    /**
     * Rejects Alert Refinement 
     *
     * @param {AlertRefinementData} alertRefinement
     * @returns {Observable<ServiceResponse<AlertRefinementData>>}
     * @memberof AlertsService
     */
    rejectRefinement(rejectAlertData: { userId: number, alertId: number }): Observable<ServiceResponse<any>> {
        return this.http.post<ServiceResponse<AlertRefinement>>(environment.apiBaseUrl + '/api/alerts/refinement/reject', rejectAlertData);
    }

    /**
     * Audition approves o Alert
     *
     * @param {AlertRefinementData} alertRefinement
     * @returns {Observable<ServiceResponse<AlertRefinementData>>}
     * @memberof AlertsService
     */
    auditApprove(payload: { userId: number, alertIds: number[] }): Observable<ServiceResponse<any>> {
        return this.http.post<ServiceResponse<AlertRefinement>>(environment.apiBaseUrl + '/api/alerts/auditing/approve', payload);
    }

    /**
     * Audit Rejects Alert Refinement 
     *
     * @param {AlertRefinementData} alertRefinement
     * @returns {Observable<ServiceResponse<AlertRefinementData>>}
     * @memberof AlertsService
     */
    auditReject(payload: { userId: number, alertId: number, reasonId: number }): Observable<ServiceResponse<any>> {
        return this.http.post<ServiceResponse<AlertRefinement>>(environment.apiBaseUrl + '/api/alerts/auditing/reject', payload);
    }

    /**
     * Audit Rejects Alert Refinement 
     *
     * @param {AlertRefinementData} alertRefinement
     * @returns {Observable<ServiceResponse<AlertRefinementData>>}
     * @memberof AlertsService
     */
    auditRefine(payload: { userId: number, alertId: number }): Observable<ServiceResponse<any>> {
        return this.http.post<ServiceResponse<AlertRefinement>>(environment.apiBaseUrl + '/api/alerts/auditing/refine', payload);
    }
}