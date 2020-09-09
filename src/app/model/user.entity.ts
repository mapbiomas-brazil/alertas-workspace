import { Group } from './user-group.entity';
import { Team } from './team.entity';

export class User {

    id: number;

    group: Group;

    name: string;

    email: string;

    photo: string;

    institution: string;

    googleId: string;

    statusId: number;

    password: string;

    createdAt: Date;

    updatedAt: Date;

    userTeams: any[];

    teams: Team[];

    roles: string[];
}