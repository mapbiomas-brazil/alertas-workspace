import { Component, ElementRef, Input, OnInit, ViewChild, SimpleChanges, OnChanges } from '@angular/core';

import Moment from 'src/lib/moment';

import { ChartsService } from '../services/charts.service';
import { AlertStatusList } from '../alerts/alert-status';


/**
 * Echarts
 *
 */

@Component({
  selector: 'app-chart3',
  template: '<div #chart></div>',
})
export class Chart3Component implements OnInit, OnChanges {

  @Input()
  parameters: any;

  width: string = '100%';

  height: string = '100%';

  @ViewChild('chart', { static: true })
  chartElem: ElementRef;

  private chart;

  updatingData;

  constructor(
    private chartsServices: ChartsService
  ) {

    $(window).resize(() => {
      this.chart.resize();
    });

  }

  ngOnInit() {

    // Chart html element
    let chartHtmlElem = this.chartElem.nativeElement as HTMLElement;

    chartHtmlElem.style.width = this.width;
    chartHtmlElem.style.height = this.height;

    this.chart = echarts.init(chartHtmlElem);

    this.loadData();

    this.updatingData = setInterval(() => {
      //this.loadData(false);
    }, 60000);

  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.parameters) {
      this.loadData();
    }
  }

  ngOnDestroy() {
    this.chart.clear();
    clearInterval(this.updatingData);
  }

  private loadData(loading = true) {

    if (loading) {
      this.chart.showLoading();
    }

    this.chartsServices.getData('alertDateStatus', this.parameters).subscribe(response => {
      this.setData(response.data);
      this.chart.hideLoading();
    });

  }

  private setData(data: any[] = null) {

    data = data.filter(item => item.status !== null);

    let statusByLabel = _.groupBy(AlertStatusList, (item: any) => {
      return item.label;
    });

    let statusById = _.groupBy(AlertStatusList, (item: any) => {
      return item.status;
    });

    let dataByStatus = _.groupBy(data, (item: any) => {
      return item.status;
    });

    let dataByDate = _.groupBy(data, (item: any) => {
      return item.date;
    });

    let dates = Object.keys(dataByDate);
    dates = Array.from(Moment.range(new Date(dates[0]), new Date()).by('day')).map((date: any) => {
      return date.toDate().toLocaleDateString();
    });

    let legends = Object.keys(statusByLabel);

    let series = Object.keys(dataByStatus).map(status => {

      let dataStatus = dataByStatus[status];

      let serieData = dates.map(date => {
        let statusDateTotal = dataStatus.filter(item => new Date(item.date).toLocaleDateString() == date).reduce((acumulador, item) => {
          return acumulador + item.total;
        }, 0);
        return statusDateTotal;
      });

      let serie = {
        name: statusById[status][0].label,
        type: 'line',
        itemStyle: {
          color: statusById[status][0].color
        },
        lineStyle: {
          color: statusById[status][0].color
        },
        areaStyle: {
          color: statusById[status][0].color
        },
        data: serieData
      };

      return serie;

    });

    let option = {
      title: {
        text: ''
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: (data) => {
          let content = "";
          data.reverse().forEach(item => {
            if (item.data > 0) {
              content += `${item.marker} ${item.seriesName} : ${Math.round(item.data)}<br/>`;
            }
          });
          return content;
        }
      },
      legend: {
        show: true,
        data: legends,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          data: dates,
          /* axisLabel: {
            formatter: (value) => {
              return new Date(value).toLocaleDateString();
            },
          } */
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: series,
      dataZoom: [
        {
          show: true,
          realtime: true,
          start: 50
        },
      ],
    };

    this.chart.setOption(option);
  }

}
