import { AlertGeometry } from './alert-geometry.entity';

export class AlertPreValidation {

    id: number;

    alertCode: number;

    alertCodeOld: number;

    alertCodeValOld: number;

    sources: string[];

    detectedAt: Date;

    insertedAt: Date;

    status: number;

    alertGeometry: AlertGeometry;
        
}