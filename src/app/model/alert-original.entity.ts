import { Geometry } from 'geojson';

export interface AlertOriginal {

    id: number;

    detectionAt: Date;

    insertionAt: Date;

    sensor: string;

    source: string;

    geometry: Geometry;

    centroid: Geometry;

    geometryArea: number;

    geometryHash: string;

    status: number;

    validationFl: boolean;

    imgBeforeAt: Date;

    imgBeforeId: number;

    imgAfterAt: Date;

    imgAfterId: number;

    processedFl: number;

    validationStatus: number;

    reason: string;
}