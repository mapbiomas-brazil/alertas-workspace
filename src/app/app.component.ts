import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { GeeAuthService } from './gee/gee-auth.service';

import { UserAuthorization } from './auth/user-authorization';
import { User } from './model/user.entity';
import { UsersService } from './services/users.service';
import { SocketService } from './socket/socket.service';
import { SocketClientEvent } from './socket/socket-client-event';
import { SocketServerEvent } from './socket/socket-server-event';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  /**
   * App Template Selected
   *
   * @memberof AppComponent
   */
  template: string;

  /**
   * Authentication
   *
   * @type {UserAuthorization}
   * @memberof AppComponent
   */
  authorization: UserAuthorization;

  /**
   * Authenticated user
   *
   * @type {User}
   * @memberof AppComponent
   */
  user: User;

  usersOnline: User[] = [];

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private usersService: UsersService,
    private geeAuthService: GeeAuthService,
    private router: Router,
    private appElem: ElementRef
  ) {

    // app starts hidden
    (<HTMLElement>this.appElem.nativeElement).style.display = 'none';

    this.socketService.initialize();

    /**
     * Authentication configs
     */
    this.authService.login().subscribe(
      (authorization: UserAuthorization) => {
        this.user = this.authService.user;
        this.template = 'default';
        setTimeout(() => {
          this.geeAuthService.login().subscribe();
        }, 5000);
      },
      error => {
        this.router.navigate(['/login'])
      });

    AuthService.Events.Logout.subscribe(() => {
      this.template = 'login';
      this.router.navigate(['/login']);
    });

    AuthService.Events.Unauthorized.subscribe(() => {
      this.template = 'login';
      this.router.navigate(['/login']);
    });

    SocketServerEvent.USERS_ONLINE.subscribe(eventData => {
      this.usersOnline = eventData.data;
    });
  }

  ngOnInit() {
    // hide loading and show app
    $('#apploading').fadeOut("slow", () => {
      $('#apploading').detach();
      $(this.appElem.nativeElement).fadeIn("slow");
    });
  }

  /**
   * App Logout
   *
   * @memberof AppComponent
   */
  logout() {
    this.authService.logout();
  }

}