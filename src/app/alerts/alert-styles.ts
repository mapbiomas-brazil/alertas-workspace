export class AlertStyles {

    static Alert = {
        default: {
            className: "alertprevalidation-default",
            color: "#e0e63b",
            fillOpacity: 0
        },
        refined: {
            className: "alertprevalidation-default",
            color: "#ff0000",
            fillOpacity: 0
        },
        simplified: {
            className: "alertprevalidation-default",
            color: "#f9b243",
            fillOpacity: 0
        }
    };

    static RefinementSamples = {
        boundery: {
            default: {
                className: "refinement-samples-alertenvelope",
                weight: 2,
                color: "#cccccc",
                opacity: 1,
                fillColor: "#cccccc",
                fillOpacity: 0
            }
        },
        deforestation: {
            default: {
                className: "refinement-samples-deforestation",
                weight: 2,
                color: "#f3ae01",
                opacity: 1,
                fillColor: "#f3ae01",
                fillOpacity: 0.2
            }
        },
        notDeforestation: {
            default: {
                className: "refinement-samples-nondeforestation",
                weight: 2,
                color: "#168800",
                opacity: 1,
                fillColor: "#168800",
                fillOpacity: 0.2
            }
        }
    }
}