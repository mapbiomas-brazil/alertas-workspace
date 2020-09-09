import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BaseMaps {

    static MapBiomas = {
        Alertas: {
            WMS: {
                url: `${environment.geoserver}/gwc/service/wms`,
                attribution: 'MapBiomas Alertas',
                layer: 'mapbiomas-alertas:dashboard_alerts-main-map',
                laefletLayer: () => L.tileLayer.wms(`${environment.geoserver}/gwc/service/wms`, {
                    layers: 'mapbiomas-alertas:dashboard_alerts-main-map',
                    format: 'image/png',
                    transparent: true,
                    viewparams: `start_date:2018-01-01;end_date:${new Date().toISOString().slice(0, 10)}`
                })
            }
        }
    };

    static GOOGLE = {
        Maps: {
            url: 'https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}',
            attribution: 'Google Maps',
            laefletLayer: () => L.tileLayer('https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
                attribution: 'Google Maps'
            })
        },
        Satellite: {
            url: 'https://mt1.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}',
            attribution: ' Google Satellite',
            laefletLayer: () => L.tileLayer('https://mt1.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}', {
                attribution: ' Google Satellite'
            })
        },
        SatelliteHybrid: {
            url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
            attribution: 'Google Satellite Hybrid',
            laefletLayer: () => L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
                attribution: 'Google Satellite Hybrid'
            })

        },
        Terrain: {
            url: 'https://mt1.google.com/vt/lyrs=t&x={x}&y={y}&z={z}',
            attribution: 'Google Terrain',
            laefletLayer: () => L.tileLayer('https://mt1.google.com/vt/lyrs=t&x={x}&y={y}&z={z}', {
                attribution: 'Google Terrain'
            })
        },
        Roads: {
            url: 'https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}',
            attribution: 'Google Roads',
            laefletLayer: () => L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', {
                attribution: 'Google Roads'
            })
        }
    }

    static OSM = {
        Standard: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: 'Open Street Maps',
            laefletLayer: () => L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Open Street Maps',
            })
        },
        Monochrome: {
            url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
            attribution: 'Open Street Maps',
            laefletLayer: () => L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
                attribution: 'Open Street Maps',
            })
        }
    }

}
