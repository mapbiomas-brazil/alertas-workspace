import { Injectable } from '@angular/core';
import * as Noty from 'noty';

@Injectable({
    providedIn: 'root',
})
export class NotificationsService {

    constructor() { }

    notify(message: string, type: string = 'success', delay = true, position: Noty.Layout = 'topRight') {

        let icon = {
            'success': '<i class="fa fa-lg fa-check" aria-hidden="true"></i> &nbsp',
            'warning': '<i class="fa fa-lg fa-exclamation-triangle" aria-hidden="true"></i> &nbsp',
            'danger': '<i class="fa fa-lg fa-ban" aria-hidden="true"></i> &nbsp',
            'info': '<i class="fa fa-lg fa-check" aria-hidden="true"></i> &nbsp',
            'loading': '<i class="fa fa-gear fa-spin fa-lg" aria-hidden="true"></i> &nbsp',
        };

        let types = {
            'success': 'success',
            'warning': 'warning',
            'danger': 'danger',
            'info': 'info',
            'loading': 'info',
        };

        let noty = new Noty({
            type: types[type],
            theme: 'metroui',
            layout: position,
            text: icon[type] + message,
            animation: {
                open: 'animated fadeIn',
                close: 'animated bounceOutRight'
            }
        });

        let showTimeout = null;

        if (delay) {
            showTimeout = setTimeout(() => {
                showTimeout = null;
                noty.show();
            }, 1500);
        } else {
            noty.show();
        }

        let notification = {
            close: (cmessage: string = null, ctype: string) => {

                if (showTimeout) {
                    clearTimeout(showTimeout);
                    return;
                }

                if (!cmessage) {
                    cmessage = message;
                }

                if (!ctype) {
                    ctype = type;
                }

                noty.setText(icon[ctype] + cmessage);
                noty.setType(types[ctype]);

                setTimeout(() => {
                    noty.close();
                }, 2000);
            }
        };

        return notification;
    }
}
