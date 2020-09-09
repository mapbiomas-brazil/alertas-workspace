import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { ServiceResponse } from './service-response';

import { Team } from '../model/team.entity';
import { User } from '../model/user.entity';
import { Group } from '../model/user-group.entity';

@Injectable({
    providedIn: 'root',
    
})
export class UsersService {

    /**
     * Auth Events
     *
     * @static
     * @memberof AuthService
     */
    static Events = {
        UserOnline: new EventEmitter(),
        UserOffline: new EventEmitter(),
        UsersOnline: new EventEmitter(),
    };

    constructor(private http: HttpClient) { }

    /**
     * User list
     * 
     * @param {any} [query=null] 
     * @returns 
     * @memberof UsersService
     */
    list(query: any = null): Observable<ServiceResponse<User[]>> {

        const httpParams = new HttpParams({
            fromObject: query
        });

        return this.http.get<ServiceResponse<User[]>>(environment.apiBaseUrl + '/api/users', {
            params: httpParams
        });
    }

    /**
     * Save user data
     * 
     * @param {*} user 
     * @returns {Observable <Object>}
     * @memberof UsersService
     */
    save(user: any): Observable<ServiceResponse<User>> {
        return this.http.post<ServiceResponse<User>>(environment.apiBaseUrl + '/api/users', user);
    }

    /**
     * Update user data
     * 
     * @param {*} user 
     * @returns {Observable <Object>}
     * @memberof UsersService
     */
    update(user: any): Observable<ServiceResponse<User>> {
        return this.http.put<ServiceResponse<User>>(environment.apiBaseUrl + '/api/users', user);
    }

    /**
     * Remove user 
     * 
     * @param {*} user 
     * @returns {Observable <Object>}
     * @memberof UsersService
     */
    delete(userId: number): Observable<Object> {
        return this.http.delete(environment.apiBaseUrl + '/api/users/' + userId);
    }

    /**
    * User Teams list
    * 
    * @param {any} [query=null] 
    * @returns 
    * @memberof UsersService
    */
    listTeams(query: any = null): Observable<ServiceResponse<Team[]>> {

        const httpParams = new HttpParams({
            fromObject: query
        });

        return this.http.get<ServiceResponse<Team[]>>(environment.apiBaseUrl + '/api/users/teams', {
            params: httpParams
        });
    }

    /**
    * Save team
    * 
    * @param {*} team 
    * @returns {Observable <Object>}
    * @memberof UsersService
    */
    saveTeam(team: any): Observable<ServiceResponse<Team>> {
        return this.http.post<ServiceResponse<Team>>(environment.apiBaseUrl + '/api/users/teams', team);
    }

    /**
     * Update team data
     * 
     * @param {*} team 
     * @returns {Observable <Object>}
     * @memberof UsersService
     */
    updateTeam(team: any): Observable<ServiceResponse<Team>> {
        return this.http.put<ServiceResponse<Team>>(environment.apiBaseUrl + '/api/users/teams', team);
    }

    /**
     * User Groups list
     * 
     * @param {any} [query=null] 
     * @returns 
     * @memberof UsersService
     */
    listGroups(query: any = null): Observable<ServiceResponse<Group[]>> {

        const httpParams = new HttpParams({
            fromObject: query
        });

        return this.http.get<ServiceResponse<Team[]>>(environment.apiBaseUrl + '/api/users/groups', {
            params: httpParams
        });
    }
}