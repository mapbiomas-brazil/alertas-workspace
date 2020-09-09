import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ModalService {

    constructor() { }

    test() {
        bootbox.alert("Hello world!");
    }

    confirm(message: string, ok: string = null, cancel: string = null, callbackOk: Function = null, callbackCancel: Function = null) {

        let buttons = {};

        if (ok) {
            buttons["ok"] = {
                label: ok,
                className: 'btn-info',
                callback: function () {
                    callbackOk();
                }
            };
        }

        if (cancel) {
            buttons["cancel"] = {
                label: cancel,
                className: 'btn-warning',
                callback: callbackCancel
            };
        }

        let dialog = bootbox.dialog({
            message: message,
            closeButton: false,
            buttons: buttons
        });
    }
}
