import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CardComponent } from '../card/card.component';
import { SwiperComponent } from '../slider/slider.component'; // Pastikan ini mengarah ke komponen yang benar
import { ModelPageComponent } from '../model-page/model-page.component';

@NgModule({
  declarations: [CardComponent, SwiperComponent, ModelPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [CardComponent, SwiperComponent, ModelPageComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Schema untuk mengizinkan penggunaan elemen kustom
})
export class ProjectComponentModule { }
