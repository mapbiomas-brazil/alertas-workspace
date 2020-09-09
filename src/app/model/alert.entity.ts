import { AlertGeometry } from './alert-geometry.entity';
import { AlertActivation } from './alert-activation.entity';
import { AlertStatus } from './alert-status.entity';
import { AlertTerritory } from './alert-territory.entity';
import { AlertRefinement } from './alert-refinement.entity';
import { RuralProperty } from './rural-property.entity';

export class Alert {

    id: number;

    alertCode: number;

    alertCodeOld: number;

    sources: string[];

    detectedAt: Date;

    insertedAt: Date;

    territory: AlertTerritory;

    status: AlertStatus;

    statusHistory: AlertStatus[];

    activation: AlertActivation;

    geometry: AlertGeometry;

    originalGeometry: AlertGeometry;

    refinement: AlertRefinement;
    
    ruralProperties: RuralProperty[];
}