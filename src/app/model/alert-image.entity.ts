
export interface AlertImage {

    id: number;

    activationId: number;

    name: string;

    product: string;

    satellite: string;

    reference: string;

    gcsUrl: string;

    gcsExists: boolean;

    geeExists: boolean;

    acquiredAt: Date;

    oldId: number;
}