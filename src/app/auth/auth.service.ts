import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { switchMap, map, catchError, tap } from 'rxjs/operators';

import { environment } from './../../environments/environment';

import { AppStorage } from '../app.storage';

import { UserAuthorization } from './user-authorization';
import { UserLoginData } from './login/user-login-data';
import { User } from '../model/user.entity';
import { group } from '@angular/animations';


@Injectable()
export class AuthService {

  /**
   * Auth Events
   *
   * @static
   * @memberof AuthService
   */
  static Events = {
    Login: new EventEmitter<UserAuthorization>(),
    Unauthorized: new EventEmitter(),
    Logout: new EventEmitter()
  };

  /**
   * User authorization data  
   *
   * @type {UserAuthorization}
   * @memberof AuthService
   */
  _authorization: UserAuthorization = null;

  constructor(
    private http: HttpClient,
    private appStorage: AppStorage
  ) { }


  /**
   * Auth Login
   *    
   * @param {UserLoginData} [user=null]
   * @returns {Observable<Object>}
   * @memberof AuthService
   */
  login(user: UserLoginData = null): Observable<Object> {

    let loginObservable$: Observable<Object>;

    const storageAuthorization$ = new Observable(subscriber => {
      subscriber.next(this.authorization);
      subscriber.complete();
    });

    const apiAuthorization$ = this.http.post(environment.apiBaseUrl + '/api/auth/login', user).pipe(
      map((response: any) => {
        this.authorization = <UserAuthorization>response.data;
        return this.authorization;
      })
    );

    if (user !== null) {
      loginObservable$ = apiAuthorization$;
    } else {
      loginObservable$ = storageAuthorization$;
    }

    loginObservable$ = loginObservable$.pipe(
      switchMap((authorization: UserAuthorization) => {
        this.authorization = authorization;
        return this.http.get(environment.apiBaseUrl + '/api/auth/user');
      }),
      map((response: any) => {
        this.authorization.user = response.data;
        return this.authorization;
      }),
      catchError(error => {
        if (error == 'Unauthorized') {
          AuthService.Events.Unauthorized.emit(error);
        }
        throw error;
      }),
      tap((authorization: UserAuthorization) => {
        AuthService.Events.Login.emit(authorization);
      })
    );

    return loginObservable$;
  }


  /**
   * Login with Google Token
   *
   * @param {string} id_token
   * @returns {Observable<Object>}
   * @memberof AuthService
   */
  loginGoogleToken(id_token: string): Observable<Object> {

    let loginObservable$ = this.http.post(environment.apiBaseUrl + '/api/auth/login/google/token', { id_token: id_token }).pipe(
      map((response: any) => {
        this.authorization = <UserAuthorization>response.data;
        return this.authorization;
      })
    );

    loginObservable$ = loginObservable$.pipe(
      switchMap((authorization: UserAuthorization) => {
        this.authorization = authorization;
        return this.http.get(environment.apiBaseUrl + '/api/auth/user');
      }),
      map((response: any) => {
        this.authorization.user = response.data;
        return this.authorization;
      }),
      catchError(error => {
        if (error == 'Unauthorized') {
          AuthService.Events.Unauthorized.emit(error);
        }
        throw error;
      }),
      tap((authorization: UserAuthorization) => {
        AuthService.Events.Login.emit(authorization);
      })
    );

    return loginObservable$;
  }

  /**
   * Auth logout
   *
   * @memberof AuthService
   */
  logout() {
    this.authorization = null;
    AuthService.Events.Logout.emit();
  }

  public get user(): User {
    return this.authorization.user;
  }

  /**
   * Gets User Authorization
   *
   * @type {UserAuthorization}
   * @memberof AuthService
   */
  public get authorization(): UserAuthorization {
    if (!this._authorization) {
      this._authorization = this.appStorage.get('authorization');
    }
    return this._authorization;
  }

  /**
   * Sets User Authorization
   *
   * @memberof AuthService
   */
  public set authorization(authorization: UserAuthorization) {
    if (authorization) {
      this.appStorage.set('authorization', this.authorization);
    } else {
      this.appStorage.delete('authorization');
    }
    this._authorization = authorization;
  }

}