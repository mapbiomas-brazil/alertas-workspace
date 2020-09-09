import { Injectable, EventEmitter } from '@angular/core';

import * as socketIo from 'socket.io-client';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserAuthorization } from '../auth/user-authorization';
import { AuthService } from '../auth/auth.service';

import { SocketClientEvent } from './socket-client-event';
import { SocketServerEvent } from './socket-server-event';
import { SocketEventData } from './socket-event-data';


@Injectable({
    providedIn: 'root',
})
export class SocketService {

    event = {
        connected: new EventEmitter()
    };

    socket: SocketIOClient.Socket;

    authorization: UserAuthorization;

    initialize() {
        AuthService.Events.Login.subscribe(authorization => {
            this.connect(authorization);
        });
    }

    connect(authorization: UserAuthorization) {

        this.authorization = authorization;

        this.socket = socketIo(environment.apiBaseUrl, {
            path: environment.websocketPath,
            query: `token=${this.authorization.token}`,
        });

        this.event.connected.emit();

        Object.keys(SocketServerEvent).forEach(eventKey => {
            this.socket.on(eventKey, (data: any) => SocketServerEvent[eventKey].emit(data));
        });

        Object.keys(SocketClientEvent).forEach(eventType => {
            SocketClientEvent[eventType].subscribe(data => {
                let socketEventData: SocketEventData<any> = {
                    type: eventType,
                    data: data
                };
                this.socket.emit('event', socketEventData);
            });
        });
    }

    isConnected(): boolean {
        return this.socket ? true : false;
    }
}