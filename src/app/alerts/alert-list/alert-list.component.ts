import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, Subject, concat } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';

import { AlertListMapComponent } from './alert-list-map.component';

import { AuthService } from 'src/app/auth/auth.service';
import { AlertsService } from 'src/app/services/alerts.service';
import { TerritoriesService } from 'src/app/services/territories.service';
import { NotificationsService } from 'src/app/core/notifications.service';
import { ServiceResponse, PaginationResponse } from 'src/app/services/service-response';

import { Alert } from 'src/app/model/alert.entity';
import { User } from 'src/app/model/user.entity';
import { Team } from 'src/app/model/team.entity';
import { Territory } from 'src/app/model/territory.entity';
import { AppStorage } from 'src/app/app.storage';
import { AlertStatusList, AlertStatusValue } from '../alert-status';
import { AlertStatus } from 'src/app/model/alert-status.entity';
import { SocketServerEvent } from 'src/app/socket/socket-server-event';

@Component({
  selector: 'app-alert-list',
  templateUrl: './alert-list.component.html'
})
export class AlertListComponent implements OnInit {

  authUser: User;

  /**
   * Alerts Map component
   *
   * @type {AlertsMapComponent}
   * @memberof AlertListComponent
   */
  @ViewChild('alertsMap', { static: true })
  alertsMap: AlertListMapComponent;

  /**
   * Alerts list
   *
   * @type {Alert[]}
   * @memberof AlertListComponent
   */
  alerts: Alert[];

  /**
   * Pagination properties
   * 
   * @type {*}
   * @memberof AlertListComponent
   */
  pagination: PaginationResponse;

  /**
   * Number of alerts by page   
   * 
   * @type {Number}
   * @memberof AlertListComponent
   */
  limit: Number = 10;

  /**
   * Pages total
   *
   * @type {number[]}
   * @memberof AlertListComponent
   */
  pages: number[];

  /**
   * Page number
   *
   * @type {number}
   * @memberof AlertListComponent
   */
  page: number;

  /**
   * Alert on zoom
   *
   * @type {Alert}
   * @memberof AlertListComponent
   */
  alertOnZoom: Alert;

  /**
   * User teams to filter alerts
   *
   * @type {Team[]}
   * @memberof AlertListComponent
   */
  userTeams: Team[];

  /**
   * Territories
   *
   * @type {Observable<any[]>}
   * @memberof AlertListComponent
   */
  territories$: Observable<Territory[]>;

  territoriesLoading = false;

  territoryInput$ = new Subject<string>();

  /**
   * Alert status list
   *
   * @memberof AlertListComponent
   */
  alertStatusList = AlertStatusList;

  alertStatusValue = AlertStatusValue;

  /**
   * Alert filter form data
   *
   * @memberof AlertListComponent
   */
  alertsFilter = {
    id: null,
    territory: null,
    biome: null,
    state: null,
    city: null,
    detectedStart: null,
    detectedEnd: null,
    team: null,
    teamId: null,
    userId: null,
    teamTerritoryId: null,
    status: new AlertStatus(),
    geeImagesValidation: true,
  };

  alertsFilterIdSubject: Subject<string> = new Subject<string>();


  /**
   * Users refining alerts by alert id 
   *
   * @type {*}
   * @memberof AlertListComponent
   */
  usersRefining: any = {}

  constructor(
    private router: Router,
    private notifications: NotificationsService,
    private appStorage: AppStorage,
    private authService: AuthService,
    private alertsService: AlertsService,
    private territoriesService: TerritoriesService
  ) {

    this.alertsFilterIdSubject.pipe(
      debounceTime(400),
      distinctUntilChanged())
      .subscribe(value => {
        this.onAlertFilterChange();
      });
  }

  ngOnInit() {

    this.authUser = this.authService.user;
    this.userTeams = this.authUser.teams;

    this.initAlertFilter();

    this.loadTerritories();

    // Loads alert list
    this.list();

    this.initEvents();

  }

  /**
   * Initialize alert filter values
   *
   * @private
   * @memberof AlertListComponent
   */
  private initAlertFilter() {

    let storageFilter = this.appStorage.get('alertFilter');

    if (storageFilter) {
      this.alertsFilter = storageFilter;
    } else {
      this.alertsFilter.team = this.authUser.teams[0];
      this.alertsFilter.teamId = this.authUser.teams[0].id;
      this.alertsFilter.userId = this.authUser.id;
      this.alertsFilter.teamTerritoryId = this.authUser.teams[0].territoryId;
      this.alertsFilter.geeImagesValidation = true;
      this.appStorage.set('alertFilter', this.alertsFilter);
      this.appStorage.set('teamId', this.authUser.teams[0].id);
    }

    this.alertsMap.setAlertsFilter(this.alertsFilter);
  }

  /**
   * List alerts data
   * 
   * @param {any} [page=null] page number for pagination data
   * @param {any} [limit=null] number of registers
   * @memberof AlertListComponent
   */
  list(page: number = null) {

    if (page) {
      this.appStorage.set('alertListPage', page);
    } else {
      page = this.appStorage.get('alertListPage') || 1;
    }

    this.page = page;

    let query = {
      limit: this.limit
    };

    if (page) {
      query['page'] = page;
    }

    this.alertsFilter.id && (query['id'] = this.alertsFilter.id);
    this.alertsFilter.detectedStart && (query['detectedStart'] = this.alertsFilter.detectedStart);
    this.alertsFilter.detectedEnd && (query['detectedEnd'] = this.alertsFilter.detectedEnd);
    this.alertsFilter.status && (query['status'] = this.alertsFilter.status.status);
    this.alertsFilter.geeImagesValidation !== null && (query['geeImagesValidation'] = this.alertsFilter.geeImagesValidation);
    this.alertsFilter.teamId && (query['teamId'] = this.alertsFilter.teamId);
    this.alertsFilter.userId && (query['userId'] = this.alertsFilter.userId);
    this.alertsFilter.territory && (query['territoryId'] = this.alertsFilter.territory.id);

    let loadingNoty = this.notifications.notify('Loading alerts...', 'loading');

    this.alertsService.list(query).subscribe(
      (result) => {
        this.alerts = result.data;
        this.pagination = result.pagination;
        loadingNoty.close(null, 'success');
        if (result.data.length == 0 && page != 1) {
          this.list(1);
        }
        this.pages = _.range(1, result.pagination.totalPages + 1);
      },
      error => {
        loadingNoty.close("Error at loading alert data.", 'warning');
      }
    );
  }

  pageChange(page: number) {
    this.list(page);
  }

  /**
   * Loads territory data
   *
   * @memberof AlertListComponent
   */
  loadTerritories() {

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
   * Zoom on a alert
   *
   * @param {Alert} alert
   * @memberof AlertListComponent
   */
  zoomToAlert(alert: Alert) {
    this.alertOnZoom = alert;
    this.alertsMap.viewAlert(alert);
  }

  /**
   * Redirect to alert refinement
   *
   * @param {Alert} alert
   * @memberof AlertListComponent
   */
  refineAlert(alert: Alert) {
    this.router.navigate(['/alerts/refinement', alert.id]);
  }

  /**
   * Dispatch when filter changes
   *
   * @param {Territory} state
   * @memberof AlertListComponent
   */
  onAlertFilterChange() {
    this.list();
    this.alertsMap.setAlertsFilter(this.alertsFilter);
    this.appStorage.set('alertFilter', this.alertsFilter);
    if (!this.alertsFilter.territory) {
      this.alertsMap.resetZoom();
    }
  }

  /**
   * Dispatch when team filter changes
   *
   * @param {Territory} state
   * @memberof AterritorielertListComponent
   */
  onAlertFilterTeamChange(team: Team) {
    this.alertsFilter.teamId = team.id;
    this.alertsFilter.teamTerritoryId = team.territoryId;
    this.alertsFilter.userId = this.authUser.id;
    this.appStorage.set('teamId', team.id);
    this.onAlertFilterChange();
  }

  /**
   * Dispatch when status filter changes
   *
   * @param {Territory} state
   * @memberof AlertListComponent
   */
  onAlertFilterStatusChange(status: any) {
    this.alertsFilter.status = status ? status : null;
    this.onAlertFilterChange();
  }

  /**
   * Dispatch when territory filter changes
   *
   * @param {Territory} state
   * @memberof AlertListComponent
   */
  onAlertFilterTerritoryChange(territory: Territory) {

    this.alertsFilter.territory = territory;

    this.alertsFilter.biome = null;
    this.alertsFilter.state = null;
    this.alertsFilter.city = null;

    if (territory && territory.category == 'biome') {
      this.alertsFilter.biome = territory;
    }
    if (territory && territory.category == 'city') {
      this.alertsFilter.city = territory;
    }
    if (territory && territory.category == 'state') {
      this.alertsFilter.state = territory;
    }


    this.onAlertFilterChange();
  }

  /**
   * Dispatch when territory city filter changes
   *
   * @param {Territory} state
   * @memberof AlertListComponent
   */
  onAlertFilterDateChange(dates: Date[]) {
    this.alertsFilter.detectedStart = dates[0].toISOString();
    this.alertsFilter.detectedEnd = dates[1].toISOString();
    $('#alertFilterDate').val(`${dates[0].toLocaleDateString()} - ${dates[1].toLocaleDateString()}`)
    this.onAlertFilterChange();
  }

  /**
   * Clear filter data
   *
   * @memberof AlertListComponent
   */
  alertFilterClear() {
    this.alertsFilter = {
      id: null,
      territory: null,
      biome: null,
      state: null,
      city: null,
      detectedStart: null,
      detectedEnd: null,
      team: this.userTeams.length ? this.userTeams[0] : null,
      teamId: this.userTeams.length ? this.userTeams[0].id : null,
      userId: this.authUser.id,
      teamTerritoryId: this.authUser.teams[0].territoryId,
      status: null,
      geeImagesValidation: true
    };
    $('#alertFilterDate').val('');
    this.onAlertFilterChange();
  }

  /**
   * Init map event 
   *
   * @private
   * @memberof AlertsMapComponent
   */
  private initEvents() {

    SocketServerEvent.ALERTS_REFINING.subscribe(eventData => {
      this.usersRefining = {};
      if (eventData.data && eventData.data.length > 0) {
        eventData.data.forEach((alertRefinig: any) => {
          this.usersRefining[alertRefinig.alert.id] = alertRefinig.user;
        });
      }
    });

    SocketServerEvent.ALERT_REFINEMENT_END.subscribe(eventData => {
      const alert: Alert = eventData.data;      
      for (let index = 0; index < this.alerts.length; index++) {
        if (this.alerts[index].id == alert.id) {
          this.alerts[index] = alert;
        }
      }
    });

  }

}