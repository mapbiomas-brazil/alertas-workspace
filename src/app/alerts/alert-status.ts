
export enum AlertStatusValue {
    NEW = 'new',
    PREANALYSIS = 'pre-analysis',
    DISAPPROVED = 'dismissed',
    PREAPPROVED = 'pre-approved',
    REJECTED = 'rejected',
    REFINED = 'refined',
    PREPARING_IMAGES = 'preparing-images',
    AUDIT = 'on-audit',
    REVISION = 'in-revision',
    APPROVED = 'approved',
    PUBLISHED = 'published'
}

export enum AlertStatusValueSccon {
    PREANALYSIS = 'NOT_ANALYZED',
    DISAPPROVED = 'DISAPPROVED',
    PREAPPROVED = 'APPROVED',
}

export const AlertStatusList = [
    {
        label: 'New',
        status: AlertStatusValue.NEW,
        sccon: null,
        color: '#c8ced3'
    },
    {
        label: 'Pre-analysis',
        status: AlertStatusValue.PREANALYSIS,
        sccon: AlertStatusValueSccon.PREANALYSIS,
        color: '#a4b6c5'
    },
    {
        label: 'Dismissed',
        status: AlertStatusValue.DISAPPROVED,
        sccon: AlertStatusValueSccon.DISAPPROVED,
        color: '#e6a69c'
    },
    {
        label: 'Pre-approved',
        status: AlertStatusValue.PREAPPROVED,
        sccon: AlertStatusValueSccon.PREAPPROVED,
        color: '#92b692'
    },
    {
        label: 'Rejected',
        status: AlertStatusValue.REJECTED,
        sccon: null,
        color: '#e19e98'
    },
    {
        label: 'Refined',
        status: AlertStatusValue.REFINED,
        sccon: null,
        color: '#85a9c1'
    },
    {
        label: 'Preparing-images',
        status: AlertStatusValue.PREPARING_IMAGES,
        sccon: null,
        color: '#8db9c6'
    },
    {
        label: 'On-audit',
        status: AlertStatusValue.AUDIT,
        sccon: null,
        color: '#bfdae3'
    },
    {
        label: 'In-revision',
        status: AlertStatusValue.REVISION,
        sccon: null,
        color: '#bfdae3'
    },
    {
        label: 'Approved',
        status: AlertStatusValue.APPROVED,
        sccon: null,
        color: '#aace73'
    },
    {
        label: 'Published',
        status: AlertStatusValue.PUBLISHED,
        sccon: null,
        color: '#cf5e47'
    },
];


export enum RejectReasonValueSccon {
    REFORESTATION = 'REFORESTATION',
    SEASONALITY = 'SEASONALITY',
    FARMING = 'FARMING',
    BURNED = 'BURNED',
    SHADOW_RELIEF = 'SHADOW_RELIEF',
    AVAILABILITY_OF_IMAGES = 'AVAILABILITY_OF_IMAGES',
    DUPLICATE = 'DUPLICATE',
    CLOUD = 'CLOUD',
    QUALITY = 'QUALITY',
    REEXPORT_PLANET_IMAGES = 'REEXPORT_PLANET_IMAGES',
    DEGRADATION = 'DEGRADATION',
    MINING = 'MINING',
    NATURAL_WITHOUT_CHANGE = 'NATURAL_WITHOUT_CHANGE',
    OTHERS = 'OTHERS',
    MINIMUM_AREA = 'MINIMUM_AREA',
    ANTROPIC_BEFORE = 'ANTROPIC_BEFORE'
}

export enum RejectReasonValueId {
    REFORESTATION = 1,
    SEASONALITY = 2,
    FARMING = 3,
    BURNED = 4,
    SHADOW_RELIEF = 5,
    AVAILABILITY_OF_IMAGES = 6,
    DUPLICATE = 7,
    CLOUD = 8,
    QUALITY = 9,
    REEXPORT_PLANET_IMAGES = 10,
    DEGRADATION = 11,
    MINING = 12,
    NATURAL_WITHOUT_CHANGE = 13,
    OTHERS = 14,
    MINIMUM_AREA = 15,
    ANTROPIC_BEFORE = 16,
    PNG_PROCESSING_ERROR = 17,
    PNG_WITH_CROPPED_IMAGE = 18,
    PNG_WITH_POLYGON_DISPLACEMENT = 19
}

export const AlertStatusRejectionReasons = [
    {
        id: RejectReasonValueId.REFORESTATION,
        sccon: RejectReasonValueSccon.REFORESTATION,
        label: 'Reforestation',
        status: 'REFORESTATION',
    },
    {
        id: RejectReasonValueId.SEASONALITY,
        sccon: RejectReasonValueSccon.SEASONALITY,
        label: 'Seasonality',
        status: 'SEASONALITY',
    },
    {
        id: RejectReasonValueId.FARMING,
        sccon: RejectReasonValueSccon.FARMING,
        label: 'Farming',
        status: 'FARMING',
    },
    {
        id: RejectReasonValueId.BURNED,
        sccon: RejectReasonValueSccon.BURNED,
        label: 'Burned',
        status: 'BURNED',
    },
    {
        id: RejectReasonValueId.SHADOW_RELIEF,
        sccon: RejectReasonValueSccon.SHADOW_RELIEF,
        label: 'Shadow relief',
        status: 'SHADOW_RELIEF',
    },
    {
        id: RejectReasonValueId.AVAILABILITY_OF_IMAGES,
        sccon: RejectReasonValueSccon.AVAILABILITY_OF_IMAGES,
        label: 'Availability of images',
        status: 'AVAILABILITY_OF_IMAGES',
    },
    {
        id: RejectReasonValueId.DUPLICATE,
        sccon: RejectReasonValueSccon.DUPLICATE,
        label: 'Duplicate',
        status: 'DUPLICATE',
    },
    {
        id: RejectReasonValueId.CLOUD,
        sccon: RejectReasonValueSccon.CLOUD,
        label: 'Cloud',
        status: 'CLOUD',
    },
    {
        id: RejectReasonValueId.QUALITY,
        sccon: RejectReasonValueSccon.QUALITY,
        label: 'Quality',
        status: 'QUALITY',
    },
    {
        id: RejectReasonValueId.REEXPORT_PLANET_IMAGES,
        sccon: RejectReasonValueSccon.REEXPORT_PLANET_IMAGES,
        label: 'Re-export planet images',
        status: 'RE-EXPORT PLANET IMAGES',
    },
    {
        id: RejectReasonValueId.DEGRADATION,
        sccon: RejectReasonValueSccon.DEGRADATION,
        label: 'Degradation',
        status: 'DEGRADATION',
    },
    {
        id: RejectReasonValueId.MINING,
        sccon: RejectReasonValueSccon.MINING,
        label: 'Mining',
        status: 'MINING',
    },
    {
        id: RejectReasonValueId.NATURAL_WITHOUT_CHANGE,
        sccon: RejectReasonValueSccon.NATURAL_WITHOUT_CHANGE,
        label: 'Natural without change',
        status: 'NATURAL WITHOUT CHANGE',
    },
    {
        id: RejectReasonValueId.OTHERS,
        sccon: RejectReasonValueSccon.OTHERS,
        label: 'Others',
        status: 'OTHERS',
    },
    {
        id: RejectReasonValueId.MINIMUM_AREA,
        sccon: RejectReasonValueSccon.MINIMUM_AREA,
        label: 'Minimum area',
        status: 'MINIMUM_AREA',
    },
    {
        id: RejectReasonValueId.ANTROPIC_BEFORE,
        sccon: RejectReasonValueSccon.ANTROPIC_BEFORE,
        label: 'Antropic before',
        status: 'ANTROPIC_BEFORE',
    },
    {
        id: RejectReasonValueId.PNG_PROCESSING_ERROR,
        sccon: null,
        label: 'PNG Processing Error',
        status: 'PNG_PROCESSING_ERROR',
    },
    {
        id: RejectReasonValueId.PNG_WITH_CROPPED_IMAGE,
        sccon: null,
        label: 'PNG with Cropped Image',
        status: 'PNG_WITH_CROPPED_IMAGE',
    },
    {
        id: RejectReasonValueId.PNG_WITH_POLYGON_DISPLACEMENT,
        sccon: null,
        label: 'PNG with Polygon Displacement',
        status: 'PNG_WITH_POLYGON_DISPLACEMENT',
    }
];
