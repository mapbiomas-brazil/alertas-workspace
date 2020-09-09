import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { distinctUntilChanged, tap, switchMap, debounceTime } from 'rxjs/operators';
import { Observable, Subject, of, concat } from 'rxjs';

import { ServiceResponse } from 'src/app/services/service-response';
import { User } from 'src/app/model/user.entity';
import { Team } from 'src/app/model/team.entity';
import { Territory } from 'src/app/model/territory.entity';

import { NotificationsService } from 'src/app/core/notifications.service';
import { UsersService } from 'src/app/services/users.service';
import { TerritoriesService } from 'src/app/services/territories.service';
import { UserSaveMapComponent } from './user-save-map.component';
import { Group } from 'src/app/model/user-group.entity';
import { AuthService } from 'src/app/auth/auth.service';
import { UserAuthorization, UserRoles } from 'src/app/auth/user-authorization';


@Component({
  selector: 'app-user-save',
  templateUrl: './user-save.component.html',
  styleUrls: ['./user-save.component.scss']
})
export class UserSaveComponent implements OnInit {

  @ViewChild('userTerritoriesMap', { static: true })
  userTerritoriesMap: UserSaveMapComponent;

  @ViewChild('userForm', { static: true })
  userForm: NgForm;

  /**
  * Authenticated user
  *
  * @type {User}
  * @memberof UserListComponent
  */
  authUser: User;

  /**
   * User data object
   *
   * @type {User}
   * @memberof UserSaveComponent
   */
  user: User = new User();

  /**
   * User teams data list
   *
   * @type {Team[]}
   * @memberof UserSaveComponent
   */
  teams: Team[] = [];

  /**
   * Team selected
   *
   * @type {Team}
   * @memberof UserSaveComponent
   */
  teamsSelected: Team[] = [];

  /**
   * User groups data list
   *
   * @type {Group[]}
   * @memberof UserSaveComponent
   */
  groups: Group[] = [];

  /**
   * Territories list
   *
   * @typeteamsSelected {Observable<Territory[]>}
   * @memberof UserSaveComponent
   */
  territories$: Observable<Territory[]>;

  territoriesLoading = false;

  territoryInput$ = new Subject<string>();

  userTeamTerritoriesSelected: Territory[] = [];

  territoryTeamSelected: Team;

  /**
   * User form validation data
   *
   * @type {*}
   * @memberof UserSaveComponent
   */
  userFormValidation: any = {
    general: true
  };

  constructor(
    private router: Router,
    private routeActivated: ActivatedRoute,
    private authService: AuthService,
    private notifications: NotificationsService,
    private usersService: UsersService,
    private territoriesService: TerritoriesService,
  ) { }

  ngOnInit() {

    this.authUser = this.authService.user;

    this.routeActivated.params.subscribe(params => {
      if (params.id) {
        this.loadUser(params.id);
      }
    });

    this.loadTeams();
    this.loadGroups();
    this.loadTerritories();

    UserSaveMapComponent.Events.GeometrySelected.subscribe(geometry => {
      this.territoriesService.list({ intersects: JSON.stringify(geometry), categoryIds: '9' }).subscribe(response => {
        let newTerritories = response.data;
        this.userTeamTerritoriesSelected.forEach(t => newTerritories.unshift(t));
        this.territoriesSelectedChange(newTerritories);
        this.userTeamTerritoriesSelected = newTerritories;
      });
    });

    this.userForm.statusChanges
      .pipe(debounceTime(200))
      .subscribe(status => {
        this.userFormValidate(status);
      });
  }

  /**
   * Loads user data
   *    
   * @param {number} userId
   * @memberof UserSaveComponent
   */
  private loadUser(userId: number) {
    const query = {
      id: userId
    };
    this.usersService.list(query).subscribe((result: any) => {
      this.user = result.data[0];
      if (this.user.teams.length) {
        this.initUserTeams();
      }
    });
  }

  /**
   * User form submits
   *
   * @memberof UserSaveComponent
   */
  userFormSubmit() {

    this.user.teams = this.teamsSelected;

    let userSaving$: Observable<ServiceResponse<User>> = null;

    if (!this.user.id) {
      userSaving$ = this.usersService.save(this.user);
    } else {
      userSaving$ = this.usersService.update(this.user);
    }

    let loadingNoty = this.notifications.notify('Saving user...', 'loading', false);

    userSaving$.subscribe(
      response => {
        loadingNoty.close('User has been successfully saved.', 'success');
        this.router.navigate(['/users'])
      },
      error => {
        loadingNoty.close("Error at save user data. Try again.", 'warning');
      });
  }

  /**
   * Validate user form
   *
   * @private
   * @param {*} data
   * @memberof UserSaveComponent
   */
  private userFormValidate(status = null) {

    const formCtrls = this.userForm.controls;

    this.userFormValidation['general'] = true;

    if (formCtrls.userEmail && formCtrls.userEmail.dirty) {
      this.usersService.list({
        email: this.user.email
      }).subscribe((result: any) => {
        if (result.data.length > 0) {
          if (result.data[0].id != this.user.id) {
            this.userFormValidation['email'] = false;
            this.userFormValidation['general'] = false;
          }
        } else {
          this.userFormValidation['email'] = true;
          this.userFormValidation['general'] = true;
        }
      });
    }

    // territories
    this.userFormValidation['territories'] = true;
    this.teamsSelected.forEach(t => {
      if (t.territories && t.territories.length == 0) {
        this.userFormValidation['territories'] = false;
        this.userFormValidation['general'] = false;
      }
    });

  }

  /**
   * Loads teams data
   *      
   * @memberof UserSaveComponent
   */
  private loadTeams() {
    this.usersService.listTeams().subscribe((result) => {
      this.teams = result.data;

      // acl conditions for coordinator
      if (this.authUser.roles.indexOf(UserRoles.AnalystCoordinator) >= 0) {
        this.teams = this.teams.filter(t1 => {
          return this.authUser.teams.filter(t2 => {
            return t2.id == t1.id;
          }).length > 0;
        });
      }
      this.initUserTeams();
    });
  }

  /**
   * Loads user groups data
   *      
   * @memberof UserSaveComponent
   */
  private loadGroups() {
    this.usersService.listGroups().subscribe((result) => {
      this.groups = result.data;

      // acl conditions for coordinator
      if (this.authUser.roles.indexOf(UserRoles.AnalystCoordinator) >= 0) {
        this.groups = this.groups.filter(g => {
          return [UserRoles.AnalystCoordinator.toString(), UserRoles.Analyst.toString()].indexOf(g.name.trim()) >= 0;
        });
      }
    });
  }

  /**
   * Loads territories data 
   *
   * @private
   * @memberof UserSaveComponent
   */
  private loadTerritories() {

    this.territories$ = concat(
      of([]),
      this.territoryInput$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.territoriesLoading = true),
        switchMap(term => {
          let query = {
            name: term,
            categories: 'city,state,biome'
          };
          return this.territoriesService.list(query).pipe(
            switchMap((result: ServiceResponse<Territory[]>) => {
              return new Observable<Territory[]>(subscriber => {
                subscriber.next(result.data);
                subscriber.complete();
                this.territoriesLoading = false;
              })
            })
          )
        })
      )
    );
  }

  /**
   * Executes when selected territories list has changed
   *
   * @param {*} $event
   * @memberof UserSaveComponent
   */
  userTeamChange(teams: Team[]) {
    this.updateMapTerritories();
    if (!this.territoryTeamSelected) {
      this.territoryTeamSelected = teams[0];
      this.userTerritoriesMap.setTeamTerritoryId(teams[0].territoryId);
      this.userTeamTerritoriesSelected = teams[0].territories;
    }

    if (teams.length == 0) {
      this.territoryTeamSelected = null;
      this.userTeamTerritoriesSelected = [];
    }
  }

  /**
   * Executes when selected territories list has changed
   *
   * @param {*} $event
   * @memberof UserSaveComponent
   */
  territoriesSelectedChange(territories: Territory[]) {

    this.teams.filter(t => t.id == this.territoryTeamSelected.id)[0].territories = territories;
    this.teamsSelected.filter(t => t.id == this.territoryTeamSelected.id)[0].territories = territories;

    this.updateMapTerritories();
  }

  /**
   * Executes when team territories list has changed
   *
   * @param {*} $event
   * @memberof UserSaveComponent
   */
  territoryTeamSelectedChange(team: Team) {
    let userTeam = this.teams.filter(t => t.id == team.id);
    this.userTeamTerritoriesSelected = userTeam.length ? userTeam[0].territories : [];
    //this.userTerritoriesMap.setTeamTerritoryId(team.territoryId);
  }

  /**
   * Sets territories on form and map
   *
   * @private
   * @param {Territory[]} territories
   * @memberof UserSaveComponent
   */
  private updateMapTerritories() {

    let teamsTerritotries = [];

    this.teamsSelected.forEach(team => {
      if (team.territories) {
        team.territories.forEach(territory => {
          teamsTerritotries.push(territory);
        })
      }
    });

    //this.userTerritoriesMap.setTerritories(teamsTerritotries);
  }


  private initUserTeams() {
    if (this.user && this.user.teams && this.teams) {
      this.teams.forEach(t1 => {
        this.user.teams.forEach(t2 => {
          if (t1.id == t2.id) {
            t1.territories = t2.territories;
          }
        });
      });
      if (this.user.teams.length) {
        this.teamsSelected = this.user.teams;
        this.territoryTeamSelected = this.teamsSelected[0];
        this.territoryTeamSelectedChange(this.teamsSelected[0]);
      }

      this.updateMapTerritories();
    }
  }

}
