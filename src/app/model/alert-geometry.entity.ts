import { Geometry } from 'geojson';

export class AlertGeometry {

    id: number;

    areaHa: number;

    geometry: Geometry;

    alertCodeOld: number;

    refined: boolean;
}