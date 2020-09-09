export class GeeMapId {

    /**
     * GEE Image mapid object
     *
     * @type {*}
     * @memberof GeeImage
     */
    mapid: MapId;

    /**
     * Leaflet TileLayer
     *
     * @type {TileLayer}
     * @memberof GeeImage
     */
    layer: any;

    constructor(mapid: MapId = null) {
        this.mapid = mapid;
        if (mapid) {
            this.updateLayer();
        }
    }

    /**
     * Sets gee mapid
     *
     * @param {MapId} mapid
     * @memberof GeeMosaic
     */
    setMapId(mapid: MapId) {
        this.mapid = mapid;
        this.updateLayer();
    }

    /**
     * Gets the GEE Image tile url 
     *
     * @returns {string}
     * @memberof GeeImage
     */
    private updateLayer() {

        let url = this.mapid.urlFormat;        

        if (!this.layer) {
            this.layer = L.tileLayer(url, {
                attribution: "Google Earth Engine"
            });

        } else {
            this.layer.setUrl(url);
            this.layer.redraw();
        }
    }

}



export interface MapId {

    /**
     * Gee mapid token
     *
     * @type {string}
     * @memberof MapId
     */
    token: string;

    /**
     * Gee mapid
     *
     * @type {string}
     * @memberof MapId
     */
    mapid: string;
    
    urlFormat: string;

}