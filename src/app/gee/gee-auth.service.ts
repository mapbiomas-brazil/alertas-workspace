import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ModalService } from '../core/modal.service';

const CLIENT_ID = '421846909566-bi64couv4ptindr13vt23a35q6nuv1ht.apps.googleusercontent.com';

@Injectable({
  providedIn: 'root'
})
export class GeeAuthService {

  static Events = {
    AuthSuccess: new EventEmitter(),
    AuthError: new EventEmitter()
  };

  static authenticated = false;

  constructor(
    private modal: ModalService
  ) { }

  /**
   * Google Earth Engine Authentication
   *  
   * @returns {Observable<any>}
   * @memberof GeeAuthService
   */
  login(): Observable<any> {

    const authentication$ = new Observable(subscriber => {
      ee.data.authenticate(CLIENT_ID,
        (data) => {
          subscriber.next(true);
          subscriber.complete();
        },
        (err) => {
          subscriber.error(err);
        }
      );
    }).pipe(
      switchMap(this.initialize),
      catchError(error => {
        return this.loginViaPopup()
      })
    );

    return authentication$;
  }

  /**
   * GEE popup login 
   *
   * @returns {Observable<any>}
   * @memberof GeeAuthService
   */
  loginViaPopup(): Observable<any> {

    const login$ = new Observable(subscriber => {
      this.modal.confirm('<img src="/assets/img/earth-engine-logo.png" height="36px"/>&nbsp Google Earth Engine permissions are required.',
        "Authorize", null,
        () => {
          ee.data.authenticateViaPopup(
            (data) => {
              subscriber.next(true);
              subscriber.complete();
            },
            (error) => {
              subscriber.error(error);
            }
          );
        });
    });

    return login$;
  }

  /**
   * Init GEE
   *
   * @returns {Observable<any>}
   * @memberof GeeAuthService
   */
  initialize(): Observable<any> {
    const initialize$ = new Observable(subscriber => {
      ee.initialize(null, null,
        (data) => {
          subscriber.next(true);
          subscriber.complete();
        },
        (error) => {
          subscriber.error(error);
        },
      );
    });
    return initialize$;
  }

}