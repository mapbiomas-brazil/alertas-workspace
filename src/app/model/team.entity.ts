
import { Territory } from './territory.entity';


export class Team {

    id: number;

    name: string;    

    createdAt: Date;

    updatedAt: Date;

    territoryId : number;
    
    territory : Territory;

    territories : Territory[];
}