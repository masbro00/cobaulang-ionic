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
  genreLabel: string = 'Acara Populer';

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
        const filteredTVShows = latestReleases.results.filter((tvShow: any) => {
          return tvShow.original_language === 'id' && tvShow.origin_country.includes('ID');
        });

        this.initializeSliderContainer = filteredTVShows.map((tvShow: any) => ({
          id: tvShow.id,
          title: tvShow.name,
          image: `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`,
          posterPath: `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`,
          releaseDate: tvShow.first_air_date,
          runtime: tvShow.episode_run_time && tvShow.episode_run_time.length > 0 ? tvShow.episode_run_time[0] : 'Unknown'
        }));
      },
      (error: any) => {
        console.error('Error fetching latest TV releases:', error);
      }
    );
  }

  loadPopularTVShows(): void {
    this.tvShowService.getPopularList(this.page, this.filteredGenreId).subscribe(
      (popularTVShows: any) => {
        console.log('Raw TV shows:', popularTVShows.results); // Tambahkan log ini
        const filteredShows = popularTVShows.results.filter((tvShow: any) => tvShow.origin_country.includes('ID'));
        console.log('Filtered TV shows:', filteredShows); // Tambahkan log ini

        const formattedShows = filteredShows.map((tvShow: any) => ({
          id: tvShow.id,
          title: tvShow.name,
          description: tvShow.overview,
          image: `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`,
          voterRating: tvShow.vote_average.toFixed(1),
          releaseYear: tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear().toString() : 'Unknown',
          runtime: tvShow.episode_run_time ? tvShow.episode_run_time[0].toString() : 'Unknown', // Pastikan runtime dikonversi ke string
          modelItem: tvShow        
        }));
        console.log('Formatted shows:', formattedShows); // Periksa log ini

        this.appCardContainer.push(...formattedShows);
        console.log('Updated appCardContainer:', this.appCardContainer);

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
      this.genreSelectedValue = selectedGenres;
      this.updateGenreLabel();
      this.loadPopularTVShows();
    }
  }

  updateGenreLabel(): void {
    if (this.genreSelectedValue.length > 0) {
      const selectedGenres = this.genreContainerList.filter(genre =>
        this.genreSelectedValue.includes(genre.id)
      );
      const genreNames = selectedGenres.map(genre => genre.name);
      this.genreLabel = genreNames.join(', ');
    } else {
      this.genreLabel = 'Acara Populer';
    }
  }

  loadData(event: any) {
    console.log('Infinite scroll triggered');
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

  changeSlide(prevOrNext: number): void {
    const swiperContainer = document.getElementById(this.swiperContainerId) as any;
    if (swiperContainer) {
      prevOrNext === -1 ? swiperContainer.swiper.slidePrev() : swiperContainer.swiper.slideNext();
    }
  }

  sliderClickEventTrigger(modelItem: any): void {
    this.cardEventListener(modelItem);
  }

  initializeGenreContainer(): void {
    this.tvShowService.getGenreList().subscribe({
      next: (genreList: any) => {
        if (genreList && genreList.genres) {
          this.genreContainerList = genreList.genres;
        } else {
          console.error('Invalid genre data:', genreList);
        }
      },
      error: (error: any) => {
        console.error('Error fetching genres:', error);
      }
    });
  }
}
