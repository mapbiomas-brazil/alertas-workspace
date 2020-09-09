import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthRoutingModule } from './auth-routing.module';
import { AppCoreModule } from '../core/core.module';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AuthGoogleService } from './auth-google.service';

import { LoginComponent } from './login/login.component';
import { UsersModule } from '../users/users.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AuthRoutingModule,
    AppCoreModule,
    UsersModule
  ],
  declarations: [
    LoginComponent
  ],
  exports: [
    LoginComponent
  ],
  providers: [
    AuthGuard,
    AuthService,
    AuthGoogleService
  ]
})
export class AuthModule { }
