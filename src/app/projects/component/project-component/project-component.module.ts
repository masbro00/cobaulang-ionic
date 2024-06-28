import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { SwiperComponent } from '../slider/slider.component'; // Pastikan ini mengarah ke komponen yang benar
import { ModelPageComponent } from '../model-page/model-page.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [CardComponent, SwiperComponent, ModelPageComponent],
  imports: [
    CommonModule,
    FormsModule, 
    IonicModule
  ],
  exports: [CardComponent, SwiperComponent, ModelPageComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProjectComponentModule { }
