import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, Renderer2, ElementRef } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ThemoviedbService } from '../../api/service/themoviedb.service';
import { forkJoin } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

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
  castItemList: any[] = [];
  crewItemList: any[] = [];
  runtime: string = '';
  voterRating: any;
  appRecomendationsContainer: any[] = [];
  isVideoEnabled: boolean = false;
  dangerousVideoUrl: string = '';
  videoUrl: any;

  constructor(
    private service: ThemoviedbService,
    private sanitizer: DomSanitizer,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private platform: Platform,
    private renderer: Renderer2,
    private el: ElementRef
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
    if (this.modelItemList) {
      this.isLoading = true;
  
      this.title = this.modelType === 'movie' ? this.modelItemList.detailResponseEl.title : this.modelItemList.detailResponseEl.original_name;
      this.id = this.modelItemList.detailResponseEl.id || '';
      this.backgroundImage = 'https://image.tmdb.org/t/p/w500/' + (this.modelItemList.detailResponseEl.backdrop_path || '');
      
      // Ensure overview is handled properly
      this.overview = this.modelItemList.detailResponseEl.overview ? this.modelItemList.detailResponseEl.overview : 'No overview available';
      console.log('Overview:', this.overview);
  
      this.releasedate = this.modelItemList.detailResponseEl.release_date || '';
      this.runtime = (this.modelItemList.detailResponseEl.runtime || '') + ' Minutes';
      this.voterRating = 'Penilaian: ' + (Number(this.modelItemList.detailResponseEl.vote_average * 10).toFixed(2)) + '%';
  
      this.castItemList = [];
      this.crewItemList = [];
  
      if (this.modelItemList.creditsResponseEl && this.modelItemList.creditsResponseEl.cast) {
        this.modelItemList.creditsResponseEl.cast.forEach((element: any) => {
          if (element.profile_path) {
            element.profile_path = 'https://image.tmdb.org/t/p/w138_and_h175_face/' + element.profile_path;
          }
          this.castItemList.push(element);
        });
      }
  
      if (this.modelItemList.creditsResponseEl && this.modelItemList.creditsResponseEl.crew) {
        this.modelItemList.creditsResponseEl.crew.forEach((element: any) => {
          if (element.profile_path) {
            element.profile_path = 'https://image.tmdb.org/t/p/w138_and_h175_face/' + element.profile_path;
          }
          this.crewItemList.push(element);
        });
      }
  
      this.isLoading = false;
      this.cdr.detectChanges();
  
      this.initializeRecomendationsContainer();
    }
  
    if (this.modelItemList && this.modelItemList.videos && this.modelItemList.videos.results.length > 0) {
      this.dangerousVideoUrl = 'https://www.youtube.com/embed/' + this.modelItemList.videos.results[0].key;
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.dangerousVideoUrl);
    }
  }

  initializeRecomendationsContainer() {
    this.service.getRecommendationList(this.modelType, this.id).subscribe(responseEl => {
      this.appRecomendationsContainer = [];
      responseEl.results.forEach((element: any) => {        
        if (element.original_language === 'id') {
          this.appRecomendationsContainer.push({
            title: this.modelType === 'movie' ? element.title : element.original_name,
            image: 'https://image.tmdb.org/t/p/w500/' + (element.backdrop_path || ''),
            modelItem: element,
            voterRating: 'Penilaian: ' + (Number(element.vote_average * 10).toFixed(2)) + '%',
            releaseYear: element.release_date ? new Date(element.release_date).getFullYear() : ''
          });
        }
      });
      this.isLoading = false;
      this.cdr.detectChanges();
    }, error => {
      console.error('Error fetching recommendations:', error);
      this.isLoading = false;
    });
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  cardEventListener(modelItem: any) {
    // no video playing in background
    this.isVideoEnabled = false;
    forkJoin({
      detailResponse: this.service.getDetailList(this.modelType, modelItem.id),
      creditResponse: this.service.getCreditsList(this.modelType, modelItem.id),
      videoResponse: this.service.getVideoList(this.modelType, modelItem.id)
    }).subscribe({
      next: response => {
        modelItem.detailResponseEl = response.detailResponse;
        modelItem.creditsResponseEl = response.creditResponse;
        modelItem.videos = response.videoResponse;
        this.presentModal(modelItem);
      },
      error: err => {
        console.error('Error fetching data', err);
      }
    });
  }

  async presentModal(modelItem: any) {
    const modal = await this.modalController.create({
      component: ModelPageComponent,
      componentProps: {
        modelItemList: modelItem,
        modelType: this.modelType
      },
      cssClass: 'fullscreen-modal'
    });

    await modal.present();
  }

  playVideo() {
    this.isVideoEnabled = true;
  }
}
