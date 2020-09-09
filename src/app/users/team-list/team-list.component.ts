import { Component, OnInit } from '@angular/core';


import { Team } from 'src/app/model/team.entity';
import { User } from 'src/app/model/user.entity';

import { ModalService } from 'src/app/core/modal.service';
import { UsersService } from 'src/app/services/users.service';
import { NotificationsService } from 'src/app/core/notifications.service';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {

  /**
   * Authenticated team
   *
   * @type {User}
   * @memberof TeamListComponent
   */
  authUser: User;

  /**
   * Team list
   *
   * @type {Team[]}
   * @memberof TeamListComponent
   */
  teams: Team[];

  /**
   * Pagination properties
   * 
   * @type {*}
   * @memberof TeamListComponent
   */
  pagination: any;

  /**
   * Number of teams registers   
   * 
   * @type {Number}
   * @memberof TeamListComponent
   */
  limit: Number = 10;


  constructor(
    private authService: AuthService,
    private teamsService: UsersService,
    private notifications: NotificationsService,
    private modal: ModalService
  ) {
    this.authUser = this.authService.user;
  }

  ngOnInit() {
    this.list();
  }

  /**
   * Lists team
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

    this.teamsService.listTeams(query).subscribe((result: any) => {
      this.teams = result.data;
      this.pagination = result.pagination;
    });

  }

  /**
   * Removes a team
   *
   * @param {Team} team
   * @memberof TeamListComponent
   */
  remove(team: Team) {
    this.modal.confirm('Are you sure you want to delete this team?', 'Confirm', 'Cancel', () => {

      let loadingNoty = this.notifications.notify('Removing team...', 'loading', false);

      this.teamsService.delete(team.id).subscribe(
        response => {
          loadingNoty.close('Team has been successfully removed.', 'success');
          this.list();
        },
        error => {
          loadingNoty.close('Error at remove team. Try again.', 'warning');
        }
      );
    });
  }
}
