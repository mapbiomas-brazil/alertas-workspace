
import { Subject } from "rxjs";

import { SocketEventData } from "./socket-event-data";
import { EventEmitter } from '@angular/core';
import { Alert } from '../model/alert.entity';

export class SocketClientEvent {

    static ALERT_REFINEMENT_START : EventEmitter<Alert> = new EventEmitter();

    static ALERT_REFINEMENT_END : EventEmitter<Alert> = new EventEmitter();
}