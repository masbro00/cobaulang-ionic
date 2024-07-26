import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, Renderer2, ElementRef } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ThemoviedbService } from '../../api/service/themoviedb.service';
import { ThemoviedbTvShowService } from '../../api/service/themoviedb-tvshow.service';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-model-page',
  templateUrl: './model-page.component.html',
  styleUrls: ['./model-page.component.scss'],
})
export class ModelPageComponent implements OnInit, OnChanges {
  @Input() modelItemList: any;
  @Input() modelType!: 'movie' | 'tv';

  isLoading: boolean = true;
  id: string = '';
  title: string = '';
  backgroundImage: string = '';
  releasedate: string = '';
  overview: string = '';
  castItemList: any[] = [];
  crewItemList: any[] = [];
  runtime: string = ''; // Untuk TV Show, Anda mungkin ingin menampilkan durasi per episode
  voterRating: any;
  appRecomendationsContainer: any[] = [];
  isVideoEnabled: boolean = false;
  dangerousVideoUrl: string = '';
  videoUrl: any;

  constructor(
    private service: ThemoviedbService,
    private tvShowService: ThemoviedbTvShowService,
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

      this.overview = this.modelItemList.detailResponseEl.overview ? this.modelItemList.detailResponseEl.overview : 'No overview available';
      console.log('Overview:', this.overview);

      this.releasedate = this.modelType === 'movie' ? this.modelItemList.detailResponseEl.release_date || '' : this.modelItemList.detailResponseEl.first_air_date || '';
      
      if (this.modelType === 'movie') {
        this.runtime = (this.modelItemList.detailResponseEl.runtime || '') + ' Minutes';
      } else if (this.modelType === 'tv') {
        this.runtime = 'N/A'; // TV Show tidak memiliki durasi total
      }

      this.voterRating = 'Penilaian: ' + (Number(this.modelItemList.detailResponseEl.vote_average * 10).toFixed(2)) + '%';

      this.castItemList = this.modelItemList.creditsResponseEl?.cast.map((element: any) => ({
        ...element,
        profile_path: element.profile_path ? 'https://image.tmdb.org/t/p/w138_and_h175_face/' + element.profile_path : ''
      })) || [];

      this.crewItemList = this.modelItemList.creditsResponseEl?.crew.map((element: any) => ({
        ...element,
        profile_path: element.profile_path ? 'https://image.tmdb.org/t/p/w138_and_h175_face/' + element.profile_path : ''
      })) || [];

      this.isLoading = false;
      this.cdr.detectChanges();

      this.initializeRecomendationsContainer();
    }

    if (this.modelItemList?.videos?.results?.length > 0) {
      this.dangerousVideoUrl = 'https://www.youtube.com/embed/' + this.modelItemList.videos.results[0].key;
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.dangerousVideoUrl);
    }
  }

  initializeRecomendationsContainer() {
    let recommendationService;
    if (this.modelType === 'movie') {
      recommendationService = this.service.getRecommendationList.bind(this.service, 'movie', this.id);
    } else if (this.modelType === 'tv') {
      recommendationService = this.tvShowService.getRecommendationList.bind(this.tvShowService, this.id);
    } else {
      console.error('modelType tidak valid');
      this.isLoading = false;
      return;
    }

    recommendationService().subscribe(responseEl => {
      this.appRecomendationsContainer = responseEl.results
        .filter((element: any) => element.original_language === 'id')
        .map((element: any) => ({
          title: this.modelType === 'movie' ? element.title : element.original_name,
          image: 'https://image.tmdb.org/t/p/w500/' + (element.backdrop_path || ''),
          modelItem: element,
          voterRating: 'Penilaian: ' + (Number(element.vote_average * 10).toFixed(2)) + '%',
          releaseYear: element.release_date ? new Date(element.release_date).getFullYear() : ''
        }));
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
    this.isVideoEnabled = false;
    forkJoin({
      detailResponse: this.modelType === 'movie'
        ? this.service.getDetailList('movie', modelItem.id)
        : this.tvShowService.getDetailList(modelItem.id),
      creditResponse: this.modelType === 'movie'
        ? this.service.getCreditsList('movie', modelItem.id)
        : this.tvShowService.getCreditsList(modelItem.id),
      videoResponse: this.modelType === 'movie'
        ? this.service.getVideoList('movie', modelItem.id)
        : this.tvShowService.getVideoList(modelItem.id)
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
        modelType: this.modelType,
      },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false
    });
    console.log(modal);
    await modal.present();
  }

  playVideo() {
    this.isVideoEnabled = true;
  }
}
