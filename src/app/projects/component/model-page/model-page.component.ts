import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ThemoviedbService } from '../../api/service/themoviedb.service';

@Component({
  selector: 'app-model-page',
  templateUrl: './model-page.component.html',
  styleUrls: ['./model-page.component.scss'],
})
export class ModelPageComponent implements OnInit, OnChanges {
  @Input() modelItemList: any;
  @Input() modelType: any;

  isLoading: boolean = true;
  id: string = '';
  title: string = '';
  backgroundImage: string = '';
  releasedate: string = '';
  overview: string = '';
  castItemList: any[] = []; // Inisialisasi sebagai array kosong
  crewItemList: any[] = []; // Inisialisasi sebagai array kosong
  runtime: string = '';
  voterRating: any;

  constructor(
    private service: ThemoviedbService,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeContainer();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['modelItemList']) {
      this.initializeContainer();
    }
  }

  initializeContainer() {
    if (this.modelItemList) { // Pastikan modelItemList tidak undefined
      this.isLoading = true;

      this.title = this.modelType === 'movie' ? this.modelItemList.detailResponseEl.title : this.modelItemList.detailResponseEl.original_name;
      this.id = this.modelItemList.detailResponseEl.id || '';
      this.backgroundImage = 'https://image.tmdb.org/t/p/w500/' + (this.modelItemList.detailResponseEl.backdrop_path || '');
      this.overview = this.modelItemList.detailResponseEl.overview || '';
      this.releasedate = this.modelItemList.detailResponseEl.release_date || '';
      this.runtime = (this.modelItemList.detailResponseEl.runtime || '') + ' Minutes';
      this.voterRating = 'User Score: ' + (Number(this.modelItemList.vote_average * 10).toFixed(2)) + '%';

      // Clear existing data
      this.castItemList = [];
      this.crewItemList = [];

      // Populate cast items
      if (this.modelItemList.creditsResponseEl && this.modelItemList.creditsResponseEl.cast) {
        this.modelItemList.creditsResponseEl.cast.forEach((element: any) => {
          if (element.profile_path) {
            element.profile_path = 'https://image.tmdb.org/t/p/w138_and_h175_face/' + element.profile_path;
          }
          this.castItemList.push(element);
        });
      }

      // Populate crew items
      if (this.modelItemList.creditsResponseEl && this.modelItemList.creditsResponseEl.crew) {
        this.modelItemList.creditsResponseEl.crew.forEach((element: any) => {
          if (element.profile_path) {
            element.profile_path = 'https://image.tmdb.org/t/p/w138_and_h175_face/' + element.profile_path;
          }
          this.crewItemList.push(element);
        });
      }

      this.isLoading = false; // Set isLoading to false after initialization
      this.cdr.detectChanges(); // Trigger change detection to update the view
    }
  }

  async closeModal() {
    await this.modalController.dismiss(); // Close the modal when Close button is clicked
  }
}
