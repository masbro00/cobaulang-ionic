import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-model-page',
  templateUrl: './model-page.component.html',
  styleUrls: ['./model-page.component.scss'],
})
export class ModelPageComponent implements OnInit {
  @Input() title: string='';

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  async closeModel() {
    await this.modalController.dismiss(); // Tutup modal saat tombol Close ditekan
  }
}
