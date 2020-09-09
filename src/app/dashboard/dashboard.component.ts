import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Team } from '../model/team.entity';
import { UsersService } from '../services/users.service';
import { map } from 'rxjs/operators';
import { AlertsService } from '../services/alerts.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  /**
   * Filter data
   *
   * @memberof DashboardComponent
   */
  formFilterData = {
    team: null,
    territories: null,
    dates: null,
    sources: null
  };

  chartParameters: any;

  teams: Team[] = [];

  sources: string[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private usersService: UsersService,
    private alertsService: AlertsService,
  ) { }

  async ngOnInit() {

    this.teams = await this.usersService.listTeams().pipe(map(response => response.data)).toPromise();
    this.sources = await this.alertsService.listAlertSources().pipe(map(response => response.data)).toPromise();

  }

  onFormFilterChange($event) {
    this.chartParameters = Object.assign({}, this.formFilterData);
  }

  clearFilter() {
    this.formFilterData.team = null;
    this.formFilterData.territories = null;
    this.formFilterData.dates = null;
    this.formFilterData.sources = null;
    this.chartParameters = Object.assign({}, this.formFilterData);
  }

}
