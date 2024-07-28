import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ThemoviedbTvShowService } from '../projects/api/service/themoviedb-tvshow.service';
import { ModelPageComponent } from '../projects/component/model-page/model-page.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  modelType: string = 'tv';
  initializeSliderContainer: any[] = [];
  swiperContainerId: string = 'swiper-container';
  genreContainerList: any[] = [];
  page: number = 1;
  filteredGenreId: string = '';
  appCardContainer: any[] = [];
  loadingCurrentEventData: any;
  currentModal: any[] = [];
  genreSelectedValue: string[] = [];

  constructor(
    private tvShowService: ThemoviedbTvShowService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.loadLatestReleases();
    this.initializeGenreContainer();
    this.loadPopularTVShows();
  }

  loadLatestReleases(): void {
    this.tvShowService.getLatestReleases().subscribe(
      (latestReleases: any) => {
        console.log('Latest TV Releases:', latestReleases.results); // Log seluruh objek hasil tanpa filter

        // Filter berdasarkan bahasa Indonesia dan country code ID
        const filteredTVShows = latestReleases.results.filter((tvShow: any) => {
          const isIndonesian = tvShow.original_language === 'id';
          const originCountry = tvShow.origin_country && tvShow.origin_country.includes('ID');
          return isIndonesian && originCountry;
        });

        console.log('Filtered TV Shows:', filteredTVShows); // Log TV shows yang difilter

        this.initializeSliderContainer = filteredTVShows.map((tvShow: any) => ({
          id: tvShow.id,
          title: tvShow.name,
          image: `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`,
          posterPath: `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`,
          releaseDate: tvShow.first_air_date,
          runtime: tvShow.episode_run_time ? tvShow.episode_run_time[0] : 'Unknown'
        }));

        console.log('Slider Container:', this.initializeSliderContainer); // Log hasil akhir
      },
      (error: any) => {
        console.error('Error fetching latest TV releases:', error);
      }
    );
  }

  sliderClickEventTrigger(modelItem: any) {
    console.log('Slider item clicked:', modelItem);
    this.cardEventListener(modelItem);
  }

  changeSlide(prevOrNext: number): void {
    const swiperContainer = document.getElementById(this.swiperContainerId) as any;
    if (swiperContainer) {
      if (prevOrNext === -1) {
        swiperContainer.swiper.slidePrev();
      } else {
        swiperContainer.swiper.slideNext();
      }
    }
  }

  initializeGenreContainer(): void {
    this.tvShowService.getGenreList().subscribe(
      (genreList: any) => {
        if (genreList && genreList.genres) {
          this.genreContainerList = genreList.genres;
        } else {
          console.error('Invalid genre data:', genreList);
        }
      },
      (error: any) => {
        console.error('Error fetching genres:', error);
      }
    );
  }

  loadPopularTVShows(): void {
    this.tvShowService.getPopularList(this.page, this.filteredGenreId).subscribe(
      (popularTVShows: any) => {
        const filteredShows = popularTVShows.results.filter((tvShow: any) => tvShow.origin_country.includes('ID'));
        const formattedShows = filteredShows.map((tvShow: any) => ({
          id: tvShow.id,
          title: tvShow.name,
          description: tvShow.overview,
          image: `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`,
          voterRating: tvShow.vote_average.toFixed(1),
          releaseYear: tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear().toString() : 'Unknown',
          runtime: tvShow.episode_run_time ? tvShow.episode_run_time[0] : 'Unknown',
          modelItem: tvShow
        }));
        this.appCardContainer.push(...formattedShows);

        if (this.page > 1 && this.loadingCurrentEventData) {
          this.loadingCurrentEventData.target.complete();
          if (popularTVShows.results.length === 0) {
            this.loadingCurrentEventData.target.disabled = true;
          }
        }
      },
      (error: any) => {
        console.error('Error fetching popular TV shows:', error);
        if (this.page > 1 && this.loadingCurrentEventData) {
          this.loadingCurrentEventData.target.complete();
        }
      }
    );
  }

  genreSelectionChanged(event: any): void {
    const selectedGenres = event.detail.value;
    if (selectedGenres.length > 0 || this.filteredGenreId !== '') {
      this.page = 1;
      this.appCardContainer = [];
      this.filteredGenreId = selectedGenres.toString();
      this.loadPopularTVShows();
    }
  }

  loadData(event: any): void {
    this.page += 1;
    this.loadingCurrentEventData = event;
    this.loadPopularTVShows();
  }

  async presentModal(tvShow: any): Promise<void> {
    const modal = await this.modalController.create({
      component: ModelPageComponent,
      componentProps: {
        modelItemList: tvShow,
        modelType: this.modelType
      }
    });
    await modal.present();
    this.currentModal.push(modal);
  }

  async dismissModal(): Promise<void> {
    if (this.currentModal.length > 0) {
      const modal = this.currentModal.pop();
      await modal.dismiss();
    }
  }

  cardEventListener(tvShow: any): void {
    forkJoin({
      detailResponse: this.tvShowService.getDetailList(tvShow.id),
      creditResponse: this.tvShowService.getCreditsList(tvShow.id),
      videoResponse: this.tvShowService.getVideoList(tvShow.id)
    }).subscribe({
      next: response => {
        tvShow.detailResponseEl = response.detailResponse;
        tvShow.creditsResponseEl = response.creditResponse;
        tvShow.videos = response.videoResponse;
        this.presentModal(tvShow);
      },
      error: err => {
        console.error('Error fetching data', err);
      }
    });
  }
}
