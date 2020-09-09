import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { ChartsService } from '../services/charts.service';
import { AlertStatusList, AlertStatusRejectionReasons } from '../alerts/alert-status';

/**
 * Echarts
 *
 */

@Component({
  selector: 'app-chart1',
  templateUrl: './chart1.component.html',
  styles: [
    `
    .table th, .table td {
      padding: 6px;
    }

    .loadingdata{
      opacity:0.3
    }
    `
  ]
})
export class Chart1Component implements OnInit, OnChanges, OnDestroy {

  @Input()
  parameters: any;

  biomes: string[] = [];

  statusByValue: any;

  alertStatus: string[] = [];

  alertStatusReasons: string[] = [];

  reasonsByValue: any;

  dataByStatusReason: any;

  dataByBiomeStatus: any;

  dataByBiomeStatusReason: any;



  //alertStatus: string[] = [];
  //statusById: any;
  //totalByBiome: any = {};

  loading = false;

  updatingData;

  constructor(
    private chartsServices: ChartsService
  ) { }

  ngOnInit() {

    this.loadData(null, () => {
      setTimeout(() => {
        $('tr[class]').each((index, element) => {
          $(`tr#${element.className} td`).css('cursor','pointer');          
          $(`tr#${element.className} td span.status.closed`).show();          
          $(`tr#${element.className} td span.status`).addClass('actived');          
        });
      }, 100);
    });

    this.updatingData = setInterval(() => {
      //this.loadData(false);
    }, 6000);



  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.parameters) {
      this.loadData();
    }
  }

  ngOnDestroy() {
    clearInterval(this.updatingData);
  }

  private loadData(loading = true, callback = null) {

    if (loading) {
      this.loading = true;
    }
    this.chartsServices.getData('alertBiomeStatus', this.parameters).subscribe(response => {
      this.setData(response.data);
      this.loading = false;
      if (callback) {
        callback();
      }
    });
  }

  private setData(data: any[] = null) {

    data = data.filter(item => {
      return item.biome != null;
    });

    // Biome data

    const dataByBiome = _.groupBy(data, (item: any) => {
      return item.biome;
    });

    this.biomes = Object.keys(dataByBiome);

    // Status

    this.statusByValue = _.groupBy(AlertStatusList, (item: any) => {
      return item.status;
    });

    Object.keys(this.statusByValue).forEach(biomeStatus => {
      this.statusByValue[biomeStatus] = this.statusByValue[biomeStatus][0];
    });

    this.alertStatus = Object.keys(this.statusByValue);

    // Status reason

    this.reasonsByValue = _.groupBy(AlertStatusRejectionReasons, (item: any) => {
      return item.id;
    });

    this.alertStatusReasons = Object.keys(this.reasonsByValue);

    // Data by status reason

    this.dataByStatusReason = _.groupBy(data, (item: any) => {
      return item.status + (item.reason ? (':' + item.reason) : '');
    });

    // Data by biome status

    this.dataByBiomeStatus = _.groupBy(data, (item: any) => {
      return item.biome + ':' + item.status;
    });

    Object.keys(this.dataByBiomeStatus).forEach(biomeStatus => {
      this.dataByBiomeStatus[biomeStatus] = this.dataByBiomeStatus[biomeStatus].reduce((acumulador, item) => {
        return acumulador + item.total;
      }, 0);
    });

    // Data by biome status reason

    this.dataByBiomeStatusReason = _.groupBy(data, (item: any) => {
      return item.biome + ':' + item.status + (item.reason ? (':' + item.reason) : '');
    });

    Object.keys(this.dataByBiomeStatusReason).forEach(biomeStatusReason => {
      this.dataByBiomeStatusReason[biomeStatusReason] = this.dataByBiomeStatusReason[biomeStatusReason].reduce((acumulador, item) => {
        return acumulador + item.total;
      }, 0);
    });
  }


  showReasons(event) {
    const htmlElement = event.srcElement as HTMLElement;
    if (htmlElement.localName == 'span') {
      $(`tr.${htmlElement.parentElement.parentElement.id}`).toggle();
      $(`tr#${htmlElement.parentElement.parentElement.id} span.actived`).toggle();
    } else {
      $(`tr.${htmlElement.parentElement.id}`).toggle();
      $(`tr#${htmlElement.parentElement.id} span.actived`).toggle();      
    }
  }
}
