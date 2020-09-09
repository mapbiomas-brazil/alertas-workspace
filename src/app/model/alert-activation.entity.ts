import { Geometry } from 'geojson';
import { AlertImage } from './alert-image.entity';

export class AlertActivation {

    id: number;

    alertStatusId: number;

    userName: string;

    userEmail: string;

    activatedAt: Date;

    insertedAt: Date;

    areaHa: number;

    geometry: Geometry;

    oldId: number;

    images: AlertImage[];
}