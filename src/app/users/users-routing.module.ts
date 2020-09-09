import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserListComponent } from './user-list/user-list.component';
import { UserSaveComponent } from './user-save/user-save.component';

import { TeamListComponent } from './team-list/team-list.component';
import { TeamSaveComponent } from './team-save/team-save.component';


const routes: Routes = [
  {
    path: '',
    component: UserListComponent
  },
  {
    path: 'new',
    component: UserSaveComponent
  },
  {
    path: 'edit/:id',
    component: UserSaveComponent
  },
  {
    path: 'teams',
    component: TeamListComponent
  },
  {
    path: 'teams/new',
    component: TeamSaveComponent
  },
  {
    path: 'teams/edit/:id',
    component: TeamSaveComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }