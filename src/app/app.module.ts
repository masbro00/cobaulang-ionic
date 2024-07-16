import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

// Import SafePipe from its file path
import { SafePipe } from './projects/component/model-page/safe.pipe';// Sesuaikan path ini dengan lokasi SafePipe di aplikasi Anda

@NgModule({
  declarations: [
    AppComponent,
    SafePipe // Tambahkan SafePipe ke dalam declarations
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
