import { Component, OnInit } from '@angular/core';

import { User } from 'src/app/model/user.entity';
import { Team } from 'src/app/model/team.entity';
import { Group } from 'src/app/model/user-group.entity';

import { ModalService } from 'src/app/core/modal.service';
import { UsersService } from 'src/app/services/users.service';
import { NotificationsService } from 'src/app/core/notifications.service';
import { TerritoriesService } from 'src/app/services/territories.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserAuthorization } from 'src/app/auth/user-authorization';



@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  /**
   * Authenticated user
   *
   * @type {User}
   * @memberof UserListComponent
   */
  authUser: User;

  /**
   * User list
   *
   * @type {User[]}
   * @memberof UserListComponent
   */
  users: User[];

  /**
   * Pagination properties
   * 
   * @type {*}
   * @memberof UserListComponent
   */
  pagination: any;

  /**
   * Number of users registers   
   * 
   * @type {Number}
   * @memberof UserListComponent
   */
  limit: Number = 10;


  /**
   * User teams data list
   *
   * @type {Team[]}
   * @memberof UserListComponent
   */
  teams: Team[];

  /**
   * User groups data list
   *
   * @type {Group[]}
   * @memberof UserListComponent
   */
  groups: Group[];

  /**
   * User Filter
   *
   * @memberof UserListComponent
   */
  userFilterData = {
    team: null,
    group: null
  };

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private notifications: NotificationsService,
    private territoriesService: TerritoriesService,
    private modal: ModalService,
  ) {
    this.authUser = this.authService.user;
  }

  ngOnInit() {

    this.list();
    this.loadTeams()
    this.loadGroups();
  }

  /**
   * List alerts data
   * 
   * @param {any} [page=null] page number for pagination data
   * @param {any} [limit=null] number of registers
   * @memberof AlertListComponent
   */
  list(page: number = 1) {

    let query = {
      limit: this.limit,
      page: page
    };

    this.userFilterData.group && (query['groupId'] = this.userFilterData.group.id);
    this.userFilterData.team && (query['teamId'] = this.userFilterData.team.id);

    if (this.authUser.roles.indexOf('Analyst') >= 0 && !query['teamId']) {
      query['teamIds'] = `${this.authUser.teams.map(team => team.id)}`;
    }

    this.usersService.list(query).subscribe((result: any) => {
      this.users = result.data;
      this.pagination = result.pagination;
    });

  }

  /**
   * Removes a user
   *
   * @param {User} user
   * @memberof UserListComponent
   */
  remove(user: User) {
    this.modal.confirm('Are you sure you want to delete this user?', 'Confirm', 'Cancel', () => {

      let loadingNoty = this.notifications.notify('Removing user...', 'loading', false);

      this.usersService.delete(user.id).subscribe(
        response => {
          loadingNoty.close('User has been successfully removed.', 'success');
          this.list();
        },
        error => {
          loadingNoty.close('Error at remove user. Try again.', 'warning');
        }
      );
    });
  }

  /**
   * Loads teams data
   *      
   * @memberof UserSaveComponent
   */
  private loadTeams() {
    /* if ([2, 3].indexOf(this.authUser.groupId) >= 0) {
      this.teams = this.authUser.teams;
    } else {
      this.usersService.listTeams().subscribe((result) => {
        this.teams = result.data;
      });
    } */
  }

  /**
   * Loads user groups data
   *      
   * @memberof UserSaveComponent
   */
  private loadGroups() {
    this.usersService.listGroups().subscribe((result) => {
      this.groups = result.data;
    });
  }
}
