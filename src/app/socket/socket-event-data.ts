import { User } from '../model/user.entity';


export interface SocketEventData<T> {
    type: string;
    clientId?: string;
    user?: User
    data?: T;
}