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
  modelType: string = 'tv'; // ModelType diatur ke 'tv' untuk memuat acara TV
  initializeSliderContainer: any[] = [];
  swiperContainerId: string = 'trending-swiper';
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
    this.loadTrendingTVShows();
    this.initializeGenreContainer();
    this.loadPopularTVShows();
  }

  loadTrendingTVShows() {
    this.tvShowService.getTrendingList().subscribe(
      (trendingTVShows: any) => {
        this.initializeSliderContainer = [];
        trendingTVShows.results.forEach((trendingTVShow: any) => {
          if (trendingTVShow.origin_country && trendingTVShow.origin_country.includes('ID')) {
            const posterUrl = `https://image.tmdb.org/t/p/w500${trendingTVShow.poster_path}`;
            this.initializeSliderContainer.push({
              id: trendingTVShow.id,
              title: trendingTVShow.name,
              image: posterUrl,
              posterPath: posterUrl,
              releaseDate: trendingTVShow.first_air_date,
              runtime: trendingTVShow.episode_run_time ? trendingTVShow.episode_run_time[0] : 'Unknown'
            });
          }
        });
      },
      (error: any) => {
        console.error('Error fetching trending TV shows:', error);
      }
    );
  }

  initializeGenreContainer() {
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

  loadPopularTVShows() {
    this.tvShowService.getPopularList(this.page, this.filteredGenreId).subscribe(
      (popularTVShows: any) => {
        popularTVShows.results.forEach((tvShow: any) => {
          if (tvShow.origin_country.includes('ID')) { // Filter Indonesian TV shows
            const posterUrl = `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`;
            this.appCardContainer.push({
              id: tvShow.id,
              title: tvShow.name,
              description: tvShow.overview,
              image: posterUrl,
              voterRating: tvShow.vote_average.toFixed(1),
              releaseYear: tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear().toString() : 'Unknown',
              runtime: tvShow.episode_run_time ? tvShow.episode_run_time[0] : 'Unknown',
              modelItem: tvShow
            });
          }
        });

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

  genreSelectionChanged(event: any) {
    const selectedGenres = event.detail.value;
    if (selectedGenres.length > 0 || this.filteredGenreId !== '') {
      this.page = 1;
      this.appCardContainer = [];
      this.filteredGenreId = selectedGenres.toString();
      this.loadPopularTVShows();
    }
  }

  loadData(event: any) {
    this.page += 1;
    this.loadingCurrentEventData = event;
    this.loadPopularTVShows();
  }

  async presentModal(tvShow: any) {
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

  async dismissModal() {
    if (this.currentModal.length > 0) {
      const modal = this.currentModal.pop();
      await modal.dismiss();
    }
  }

  cardEventListener(tvShow: any) {
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
