import { User } from '../model/user.entity';


export class UserAuthorization {

    /**
     * Token Access
     *
     * @type {string}
     * @memberof UserAuthorization
     */
    token: string;

    /**
     * User data
     *
     * @type {*}
     * @memberof UserAuthorization
     */
    user: User;
}

export enum UserRoles {
    Admin = 'Admin',
    AnalystCoordinator = 'Analyst Coordinator',
    Analyst = 'Analyst'
}