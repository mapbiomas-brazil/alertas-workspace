import { Component, OnInit, ViewChild } from '@angular/core';

import { Observable, of, Subject, concat } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

import { AuthService } from 'src/app/auth/auth.service';
import { RuralPropertiesService } from 'src/app/services/rural-properties.service';
import { AlertsService } from 'src/app/services/alerts.service';
import { NotificationsService } from 'src/app/core/notifications.service';
import { ModalService } from 'src/app/core/modal.service';
import { TerritoriesService } from 'src/app/services/territories.service';
import { ServiceResponse } from 'src/app/services/service-response';

import { AppStorage } from 'src/app/app.storage';

import { User } from 'src/app/model/user.entity';
import { Team } from 'src/app/model/team.entity';
import { Alert } from 'src/app/model/alert.entity';
import { Territory } from 'src/app/model/territory.entity';

import { AlertAuditingItemModalComponent } from './alert-auditing-item-modal.component';
import { AlertStatusList, AlertStatusRejectionReasons, AlertStatusValue } from '../alert-status';

@Component({
  selector: 'app-alert-auditing',
  templateUrl: './alert-auditing.component.html',
  styleUrls: ['./alert-auditing.component.scss']
})
export class AlertAuditingComponent implements OnInit {

  /**
   * Authenticated user
   *
   * @type {User}
   * @memberof AlertAuditingComponent
   */
  authUser: User;


  /**
   * Google Storage Bucket for alert images
   *
   * @memberof AlertAuditingComponent
   */
  alertsBucket = environment.alertsBucket;

  /**
   * Alerts Map component
   *
   * @type {AlertsMapComponent}
   * @memberof AlertListComponent
   */
  @ViewChild('alertModal', { static: true })
  alertModal: AlertAuditingItemModalComponent;

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
  pagination: any;

  /**
   * Number of alerts by page   
   * 
   * @type {Number}
   * @memberof AlertListComponent
   */
  limit: Number = 30;

  /**
   * User teams to filter alerts
   *
   * @type {Team[]}
   * @memberof AlertListComponent
   */
  userTeams: Team[];

  /**
   * Alert status list
   *
   * @memberof AlertListComponent
   */
  alertStatus = AlertStatusList;

  alertRejectionReasons = AlertStatusRejectionReasons;

  isProcessing = false;

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
   * Alert filter form data
   *
   * @memberof AlertListComponent
   */
  alertsFilter = {
    id: null,
    team: null,
    statusId: null,
    dateStart: null,
    dateEnd: null,
    territory: null,
    teamId: null,
    biome: null,
    state: null,
    city: null
  };

  alertsFilterIdSubject: Subject<string> = new Subject<string>();

  constructor(
    private notifications: NotificationsService,
    private modalService: ModalService,
    private appStorage: AppStorage,
    private authService: AuthService,
    private alertsService: AlertsService,
    private territoriesService: TerritoriesService,
    private ruralPropertiesService: RuralPropertiesService
  ) {

    this.alertsFilterIdSubject.pipe(
      debounceTime(400),
      distinctUntilChanged())
      .subscribe(value => {
        this.list();
      });
  }

  ngOnInit() {

    this.authUser = this.authService.user;
    this.userTeams = this.authUser.teams;

    this.alertsFilter.team = this.authUser.teams[0];

    this.loadTerritories();

    // Loads alert list
    this.list();
  }


  /**
   * List alerts data
   * 
   * @param {any} [page=null] page number for pagination data
   * @param {any} [limit=null] number of registers
   * @memberof AlertListComponent
   */
  list() {

    this.isProcessing = true;

    let query = {
      limit: this.limit
    };

    query['page'] = 1;
    query['status'] = AlertStatusValue.AUDIT;
    query['teamId'] = this.alertsFilter.team.id;

    this.alertsFilter.id && (query['id'] = this.alertsFilter.id);
    this.alertsFilter.territory && (query['territoryId'] = this.alertsFilter.territory.id);

    let loadingNoty = this.notifications.notify('Loading alerts...', 'loading');

    this.alertsService.list(query)
      .pipe(
        switchMap(alertsResponse => {
          if (alertsResponse.data.length == 0) {
            return of(alertsResponse);
          }
          return this.ruralPropertiesService.list({ alertIds: alertsResponse.data.map(alert => alert.id).join(',') })
            .pipe(
              map(rpropertiesResponse => {
                alertsResponse.data = alertsResponse.data.map(alert => {
                  alert.ruralProperties = rpropertiesResponse.data
                    .filter(rproperty => rproperty.alerts.filter(pAlert => pAlert.id == alert.id).length > 0);
                  return alert;
                });
                return alertsResponse;
              })
            );
        })
      )
      .subscribe(
        (response) => {
          this.isProcessing = false;
          this.alerts = response.data;
          this.pagination = response.pagination;
          loadingNoty.close(null, 'success');
        },
        error => {
          this.isProcessing = false;
          loadingNoty.close("Error at loading alert data.", 'warning');
        }
      );
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
  * Dispatch when team filter changes
  *
  * @param {Territory} state
  * @memberof AterritorielertListComponent
  */
  onAlertFilterTeamChange(team: Team) {
    this.alertsFilter.team = team;
    this.list();
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
    this.list();
  }

  openAlert(alert: Alert) {
    this.alertModal.viewAlert(alert);
  }

  approveAll() {

    this.modalService.confirm('Do you really want approve all these alerts?', 'Yes', 'No', () => {

      this.isProcessing = true;

      let loadingNoty = this.notifications.notify('Approving alerts...', 'loading');

      let approvePayload = {
        userId: this.authUser.id,
        alertIds: this.alerts.map(alert => alert.id),
      };

      this.alertsService.auditApprove(approvePayload).subscribe(
        result => {
          this.isProcessing = false;
          this.alerts = [];
          this.list();
          loadingNoty.close(null, 'success');
        },
        error => {
          this.isProcessing = false;
          loadingNoty.close("Error. Try again.", 'warning');
        }
      );

    });

  }

  approve(alert: Alert) {

    this.modalService.confirm('Do you really want approve this alert?', 'Yes', 'No', () => {

      this.isProcessing = true;

      let loadingNoty = this.notifications.notify('Approving alert...', 'loading');

      let approvePayload = {
        userId: this.authUser.id,
        alertIds: [alert.id],
      };

      this.alertsService.auditApprove(approvePayload).subscribe(
        result => {
          this.isProcessing = false;
          this.alerts = this.alerts.filter(item => item.id != alert.id);
          loadingNoty.close(null, 'success');
        },
        error => {
          this.isProcessing = false;
          loadingNoty.close("Error. Try again.", 'warning');
        }
      );
    });

  }

  refine(alert: Alert) {

    this.modalService.confirm('Do you really want refine again this alert?', 'Yes', 'No', () => {

      this.isProcessing = true;

      let loadingNoty = this.notifications.notify('Sending to refine again...', 'loading');

      let approvePayload = {
        userId: this.authUser.id,
        alertId: alert.id,
      };

      this.alertsService.auditRefine(approvePayload).subscribe(
        result => {
          this.isProcessing = false;
          this.alerts = this.alerts.filter(item => item.id != alert.id);
          loadingNoty.close(null, 'success');
        },
        error => {
          this.isProcessing = false;
          loadingNoty.close("Error. Try again.", 'warning');
        }
      );

    });

  }


  reject(alert: Alert, reasonId: number) {

    this.modalService.confirm('Do you really want reject this alert?', 'Yes', 'No', () => {

      this.isProcessing = true;

      let loadingNoty = this.notifications.notify('Rejecting alert...', 'loading');

      let rejectData = {
        userId: this.authUser.id,
        alertId: alert.id,
        reasonId: reasonId
      };

      this.alerts = this.alerts.filter(item => item.id != alert.id);

      this.alertsService.auditReject(rejectData).subscribe(
        result => {
          this.isProcessing = false;
          this.alerts = this.alerts.filter(item => item.id != alert.id);
          loadingNoty.close(null, 'success');
        },
        error => {
          this.isProcessing = false;
          loadingNoty.close("Error. Try again.", 'warning');
        }
      );

    });

  }


  rejectPNG(alert: Alert, reasonId: number) {

    this.modalService.confirm('Do you really want reprocess alert PNGs?', 'Yes', 'No', () => {

      this.isProcessing = true;

      let loadingNoty = this.notifications.notify('Sending alert to reprocess...', 'loading');

      let rejectData = {
        userId: this.authUser.id,
        alertId: alert.id,
        reasonId: reasonId
      };

      this.alerts = this.alerts.filter(item => item.id != alert.id);

      this.alertsService.auditReject(rejectData).subscribe(
        result => {
          this.isProcessing = false;
          this.alerts = this.alerts.filter(item => item.id != alert.id);
          loadingNoty.close(null, 'success');
        },
        error => {
          this.isProcessing = false;
          loadingNoty.close("Error. Try again.", 'warning');
        }
      );

    });

  }
}