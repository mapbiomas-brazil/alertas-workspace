import { Component, ElementRef, Input, OnInit, ViewChild, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { ChartsService } from '../services/charts.service';
import { AlertStatusList, AlertStatusValue } from '../alerts/alert-status';

/**
 * Echarts
 *
 */

@Component({
  selector: 'app-chart2',
  template: '<div #chart></div>',
})
export class Chart2Component implements OnInit, OnChanges, OnDestroy {

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
    const chartHtmlElem = this.chartElem.nativeElement as HTMLElement;

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

    this.chartsServices.getData('alertStatusReasonGee', this.parameters).subscribe(response => {
      this.setData(response.data);
      this.chart.hideLoading();
    });

  }

  private setData(data: any[] = null) {

    data = data.map(item => {
      if (item.status == null) {
        item.status = 1;
      }
      return item;
    });

    const alertStatusList = AlertStatusList.slice().reverse();

    const statusLabels = alertStatusList.map(status => {
      return status.label;;
    });

    const serieData0 = alertStatusList.map(alertStatus => {

      const sdata = data
        .filter(d => {
          if (alertStatus.status == AlertStatusValue.PREAPPROVED) {
            return d.status == alertStatus.status && d.gee_valid == true;
          }
          else if (alertStatus.status == AlertStatusValue.DISAPPROVED) {
            return d.status == alertStatus.status && d.reason_id != 6;
          }
          else {
            return d.status == alertStatus.status;
          }
        })
        .reduce((acumulator, d) => {
          return acumulator += d.total;
        }, 0);

      return {
        value: sdata,
        name: alertStatus.label,
        label: {
          show: sdata == 0 ? false : true,
          position: 'right',
          color: '#000',
          fontWeight: 'bold'
        },
        labelLine: {
          show: false,
          lineStyle: {
            width: 0
          }
        },
        itemStyle: {
          color: alertStatus.color
        }
      };
    });

    const serieData1 = alertStatusList.map(alertStatus => {

      const sdata = data
        .filter(d => {
          return d.status == alertStatus.status && d.status == AlertStatusValue.PREAPPROVED && d.gee_valid != true
        })
        .reduce((acumulator, d) => {
          return acumulator += d.total;
        }, 0);

      return {
        value: sdata,
        name: alertStatus.label,
        label: {
          show: sdata == 0 ? false : true,
          position: ['110%', '65%'],
          color: '#000',
          fontWeight: 'bold'
        },
        labelLine: {
          show: false,
          lineStyle: {
            width: 0
          }
        },
        itemStyle: {
          color: '#c8d6c8',
        }
      };
    });

    const serieData2 = alertStatusList.map(alertStatus => {

      const sdata = data
        .filter(d => {
          return d.status == alertStatus.status && d.status == AlertStatusValue.DISAPPROVED && d.reason_id == 6
        })
        .reduce((acumulator, d) => {
          return acumulator += d.total;
        }, 0);

      return {
        value: sdata,
        name: alertStatus.label,
        label: {
          show: sdata == 0 ? false : true,
          position: ['110%', '65%'],
          color: '#000',
          fontWeight: 'bold'
        },
        labelLine: {
          show: false,
          lineStyle: {
            width: 0
          }
        },
        itemStyle: {
          color: '#e8cdc9'
        }
      };
    });

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params) => {
          let content = '';
          params.forEach(serie => {
            if (serie.value != 0) {
              content += `
              ${serie.marker} ${serie.seriesName == 'Alerts' ? serie.axisValue : serie.seriesName} : ${serie.value} <br/>
              `;
            }
          });
          return content;
        }
      },
      grid: {
        left: '3%',
        right: '8%',
        top: '3%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'value'
        }
      ],
      yAxis: [
        {
          type: 'category',
          axisTick: {
            show: false
          },
          data: statusLabels
        }
      ],
      series: [
        {
          name: 'Alerts',
          type: 'bar',
          stack: 'status',
          data: serieData0,
          z: 10
        },
        {
          name: 'No images on GEE',
          type: 'bar',
          stack: 'status',
          data: serieData1,
        },
        {
          name: 'Availability of images',
          type: 'bar',
          stack: 'status',
          data: serieData2
        },
      ]
    };

    this.chart.setOption(option);
  }

}
