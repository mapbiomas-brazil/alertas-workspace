import { Injectable } from '@angular/core';
import * as Store from 'store';

@Injectable()
export class AppStorage {

    constructor() {
        if (!Store.get('app')) {
            Store.set('app', {});
        }
    }

    /**
     * Sets a app storege value
     * 
     * @param {string} key 
     * @param {any} value 
     * @memberof AppConfig
     */
    set(key: string, value) {
        let appStorage = Store.get('app');
        appStorage[key] = value;                
        Store.set('app', appStorage);
    }
    
    /**
     * Gets a app storege value          
     *
     * @param {string} key
     * @returns {*}
     * @memberof AppStorage
     */
    get(key: string): any {
        let appStorage = Store.get('app');
        return appStorage[key];
    }

    /**
     * Deletes a app storege value     
     * 
     * @param {string} key 
     * @returns 
     * @memberof AppConfig
     */
    delete(key: string) {
        let appStorage = Store.get('app');
        delete appStorage[key];
        Store.set('app', appStorage);
    }
}






