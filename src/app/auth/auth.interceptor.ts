import { Injectable, Injector } from '@angular/core';
import {
    HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthService
    ) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler) {

        let authReq = req;

        if (!req.headers.get('authorization') && this.authService.authorization && req.url.search('earthengine') < 0) {
            authReq = req.clone({ setHeaders: { 'authorization': `Bearer ${this.authService.authorization.token}` } });
        }

        let handle = next.handle(authReq).pipe(
            catchError(err => {
                if (err.status == 401) {
                    //this.authService.logout();
                    throw "Unauthorized";
                }
                throw `Error ${err.status}`;
            })
        );

        return handle;
    }
}