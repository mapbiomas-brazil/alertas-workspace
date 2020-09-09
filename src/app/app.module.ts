import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppCoreModule } from './core/core.module';
import { AppStorage } from './app.storage';
import { AppHttpInterceptorProviders } from './app.interceptors';

import { AuthModule } from './auth/auth.module';
import { LayoutModule } from './layout/layout.module';
import { MapModule } from './map/map.module';
import { GeeModule } from './gee/gee.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    AppCoreModule,
    AuthModule,
    LayoutModule,
    MapModule,
    GeeModule,
    DashboardModule
  ],
  providers: [
    AppHttpInterceptorProviders,
    AppStorage
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
