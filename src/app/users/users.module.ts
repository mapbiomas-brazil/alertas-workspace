import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppCoreModule } from '../core/core.module';
import { UsersRoutingModule } from './users-routing.module';
import { ServicesModule } from '../services/services.module';

import { UserListComponent } from './user-list/user-list.component';
import { UserSaveComponent } from './user-save/user-save.component';
import { UserSaveMapComponent } from './user-save/user-save-map.component';
import { TeamListComponent } from './team-list/team-list.component';
import { TeamSaveComponent } from './team-save/team-save.component';
import { TeamSaveMapComponent } from './team-save/team-save-map.component';

@NgModule({
  imports: [
    CommonModule,
    AppCoreModule,
    UsersRoutingModule,
    ServicesModule
  ],
  declarations: [
    UserListComponent,
    UserSaveComponent,
    UserSaveMapComponent,
    TeamListComponent,
    TeamSaveComponent,
    TeamSaveMapComponent
  ],
})
export class UsersModule { }
