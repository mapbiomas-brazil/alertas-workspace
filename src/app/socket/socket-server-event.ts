
import { EventEmitter } from '@angular/core';
import { Subject } from "rxjs";

import { SocketEventData } from "./socket-event-data";

import { Alert } from '../model/alert.entity';
import { User } from '../model/user.entity';


export class SocketServerEvent {

    static CLIENT_CONNECTED: EventEmitter<SocketEventData<any>> = new EventEmitter();

    static CLIENT_DISCONNECTED: EventEmitter<SocketEventData<any>> = new EventEmitter();

    static USER_ONLINE: EventEmitter<SocketEventData<User>> = new EventEmitter();

    static USERS_ONLINE: EventEmitter<SocketEventData<User[]>> = new EventEmitter();

    static USER_OFFLINE: EventEmitter<SocketEventData<User>> = new EventEmitter();

    static ALERTS_REFINING: EventEmitter<SocketEventData<Alert[]>> = new EventEmitter();

    static ALERT_REFINEMENT_START : EventEmitter<Alert> = new EventEmitter();

    static ALERT_REFINEMENT_END : EventEmitter<Alert> = new EventEmitter();
}