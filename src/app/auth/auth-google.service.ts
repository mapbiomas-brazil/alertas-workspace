import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment.staging';

//https://developers.google.com/identity/sign-in/web/reference

@Injectable()
export class AuthGoogleService {

  /**
   * Auth Events
   *
   * @static
   * @memberof AuthService
   */
  static Events = {
    Login: new EventEmitter(),
  };

  private auth2: any;

  constructor() { }


  init() {

    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init({
        client_id: environment.googleClientId,
        scope: 'profile email',
        cookiepolicy: 'single_host_origin',
      });

      this.auth2.then(() => {
        this.renderButton();        
      });

    });

  }

  login() {
    this.auth2.signIn().then(this.loginSuccess);
  }

  loginSuccess(googleUser) {

    let profile = googleUser.getBasicProfile();

    AuthGoogleService.Events.Login.emit({
      user: {
        id: profile.getId(),
        name: profile.getName(),
        givenName: profile.getGivenName(),
        familyName: profile.getFamilyName(),
        imageUrl: profile.getImageUrl(),
        email: profile.getEmail()
      },
      id_token: googleUser.getAuthResponse().id_token
    });

  }

  private renderButton() {

    $('#g-signin-btn').hide();

    gapi.signin2.render("g-signin-btn", {
      scope: 'profile email',
      width: 300,
      height: 40,
      longtitle: true,
      theme: 'light',
      onsuccess: (googleUser) => {
        this.loginSuccess(googleUser);
      },
      onfailure: null
    });

    setTimeout(() => {
      $('#g-signin-btn .abcRioButton').css('width', '100%');
      $('#g-signin-btn').show();
    }, 500);

  }

}