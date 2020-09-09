import { Geometry } from 'geojson';

export class AlertRefinement {

    id: number;

    userId: number;

    alertStatusId: number;

    simplificationValue: number;

    insertedAt: Date;

    geometryBounds: Geometry;

    geometrySamplesDeforestation: Geometry;

    geometrySamplesNotDeforestation: Geometry;

    geometryRaw: Geometry;
}