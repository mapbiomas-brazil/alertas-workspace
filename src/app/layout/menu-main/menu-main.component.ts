import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/model/user.entity';
import { UserAuthorization, UserRoles } from 'src/app/auth/user-authorization';

@Component({
  selector: 'app-menu-main',
  templateUrl: './menu-main.component.html',
  styleUrls: ['./menu-main.component.scss']
})
export class MenuMainComponent implements OnInit {

  /**
  * Authenticated user
  *
  * @type {User}
  * @memberof MenuMainComponent
  */
  authUser: User;

  userRoles = UserRoles;

  constructor(
    private authService: AuthService,
  ) {
  }
  ngOnInit() {
    this.authUser = this.authService.user;
  }

}
