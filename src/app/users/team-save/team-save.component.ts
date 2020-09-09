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
import { TeamSaveMapComponent } from './team-save-map.component';


@Component({
  selector: 'app-team-save',
  templateUrl: './team-save.component.html',
  styleUrls: ['./team-save.component.scss']
})
export class TeamSaveComponent implements OnInit {

  @ViewChild('teamTerritoriesMap', { static: true })
  teamTerritoriesMap: TeamSaveMapComponent;

  @ViewChild('teamForm', { static: true })
  teamForm: NgForm;

  /**
   * Team data object
   *
   * @type {Team}
   * @memberof TeamSaveComponent
   */
  team: Team = new Team();
  
  /**
   * Territories list
   *
   * @type {Territory[]}
   * @memberof TeamSaveComponent
   */
  territories: Territory[];

  teamTerritorySelected: Territory;

  /**
   * Team form validation data
   *
   * @type {*}
   * @memberof TeamSaveComponent
   */
  teamFormValidation: any = {
    general: true
  };

  constructor(
    private router: Router,
    private routeActivated: ActivatedRoute,
    private notifications: NotificationsService,
    private usersService: UsersService,
    private territoriesService: TerritoriesService,
  ) { }

  ngOnInit() {

    this.routeActivated.params.subscribe(params => {
      if (params.id) {
        this.loadUser(params.id);
      }
    });

    this.loadTerritories();

    this.teamForm.statusChanges
      .pipe(debounceTime(200))
      .subscribe(status => {
        this.teamFormValidate(status);
      });
  }

  /**
   * Loads team data
   *    
   * @param {number} teamId
   * @memberof TeamSaveComponent
   */
  private loadUser(teamId: number) {
    let query = {
      id: teamId
    };
    this.usersService.listTeams(query).subscribe((result: any) => {
      let team = result.data[0];
      this.team = team;
      this.updateMapTerritories();
    });
  }

  /**
   * Team form submits
   *
   * @memberof TeamSaveComponent
   */
  teamFormSubmit() {

    let teamSaving$: Observable<ServiceResponse<Team>> = null;

    this.team.territoryId = this.team.territory.id;

    if (!this.team.id) {
      teamSaving$ = this.usersService.saveTeam(this.team);
    } else {
      teamSaving$ = this.usersService.updateTeam(this.team);
    }

    let loadingNoty = this.notifications.notify('Saving team...', 'loading', false);

    teamSaving$.subscribe(
      response => {
        loadingNoty.close('Team has been successfully saved.', 'success');
        this.router.navigate(['/users/teams'])
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
   * @memberof TeamSaveComponent
   */
  private teamFormValidate(status = null) {

    let formCtrls = this.teamForm.controls;

    this.teamFormValidation['general'] = true;

  }

  /**
   * Loads territories data 
   *
   * @private
   * @memberof TeamSaveComponent
   */
  private loadTerritories() {

    let query = {
      categories: 'biome'
    };

    this.territoriesService.list(query).subscribe(response => {
      this.territories = response.data;      
    });

  }

  /**
   * Executes when selected territories list has changed
   *
   * @param {*} $event
   * @memberof TeamSaveComponent
   */
  territoriesSelectedChange(territories: Territory[]) {
    this.updateMapTerritories();
  }


  /**
   * Sets territories on form and map
   *
   * @private
   * @param {Territory[]} territories
   * @memberof TeamSaveComponent
   */
  private updateMapTerritories() {
    let teamsTerritotries = [this.team.territory];
    this.teamTerritoriesMap.setTerritories(teamsTerritotries);
  }

}
