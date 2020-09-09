import { Geometry } from '@turf/turf';
import { Alert } from './alert.entity';

export class RuralProperty {
    id: number;
    version: number;
    carCode: string;
    carType: string;
    carModule: number;
    carUpdatedAt: number;
    stateAcronym: string;
    insertedAt: number;
    geometry: Geometry;
    areaHa: number;
    alerts: Alert[];
}