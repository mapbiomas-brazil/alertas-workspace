import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms';
import { UserLoginData } from './user-login-data';
import { AuthGoogleService } from '../auth-google.service';
import { Router } from '@angular/router';
import { GeeAuthService } from 'src/app/gee/gee-auth.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  /**
   * User credentials form
   *
   * @type {NgForm}
   * @memberof LoginComponent
   */
  @ViewChild('userLoginForm', { static: true })
  userLoginForm: NgForm;

  /**
   * Card login element    
   *
   * @type {ElementRef}
   * @memberof LoginComponent
   */
  @ViewChild('loginCard', { static: true })
  loginCard: ElementRef;

  /**
   * User credentials to login
   *
   * @type {UserCredentials}
   * @memberof LoginComponent
   */
  userLoginData: UserLoginData = new UserLoginData();

  /**
   * Indicates if happen authorization error
   *
   * @type {boolean}
   * @memberof LoginComponent
   */
  isAuthError: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private geeAuthService: GeeAuthService,
    private authGoogleService: AuthGoogleService) {
  }

  ngOnInit() {   

    this.authGoogleService.init();

  }

  /**
   * Login with form data
   *
   * @memberof LoginComponent
   */
  login() {

    this.authService.login(this.userLoginData).subscribe(
      authorization => {
        this.geeAuthService.login().subscribe(
          () => {
            window.location.assign("/");
          },
          error => {
            this.geeAuthService.loginViaPopup().subscribe(() => {
              window.location.assign("/");
            });
          }
        );
      },
      error => {
        
      }
    );
  }

  /**
   * Login with google
   *
   * @memberof LoginComponent
   */
  loginGoogle() {
    let loginSubscription = AuthGoogleService.Events.Login.subscribe(googleUser => {

      this.authService.loginGoogleToken(googleUser.id_token).pipe(
        switchMap(authorization => {
          return this.geeAuthService.login();
        }))
        .subscribe(
          authorization => {
            window.location.assign("/");
          },
          error => {
            $('#auth-error-msg').slideDown();
            setTimeout(() => {
              $('#auth-error-msg').slideUp();
            }, 5000);
          }
        );

      loginSubscription.unsubscribe();

    });
  }
}
