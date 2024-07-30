import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ThemoviedbService } from '../projects/api/service/themoviedb.service';
import { ModelPageComponent } from '../projects/component/model-page/model-page.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  modelType: string = 'movie';
  initializeSliderContainer: any[] = [];  // Untuk film di slider
  swiperContainerId: string = 'swiper-container';
  genreContainerList: any[] = [];
  page: number = 1;
  genreSelectedValue: any = [];
  filteredGenreId: string = '';
  appCardContainer: any[] = [];  // Untuk film di card
  loadingCurrentEventData: any;
  currentModal: any[] = [];
  genreLabel: string = 'Film Populer';

  constructor(
    private service: ThemoviedbService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.loadPopularMoviesForSlider(); // Memuat film populer untuk slider
    this.initializeGenreContainer();
    this.loadPopularMovies();
  }

  loadPopularMoviesForSlider(): void {
    this.service.getPopularList(this.page, this.filteredGenreId).subscribe(
      (popularMoviesEl: any) => {
        this.filterAndDisplayMovies(popularMoviesEl.results, 'initializeSliderContainer');
      },
      (error: any) => {
        console.error('Error fetching popular movies for slider:', error);
      }
    );
  }

  loadPopularMovies(): void {
    this.service.getPopularList(this.page, this.filteredGenreId).subscribe({
      next: (popularMoviesEl: any) => {
        this.filterAndDisplayMovies(popularMoviesEl.results, 'appCardContainer');
      },
      error: (error: any) => {
        console.error('Error fetching popular movies:', error);
      },
      complete: () => {
        if (this.loadingCurrentEventData && this.loadingCurrentEventData.target) {
          this.loadingCurrentEventData.target.complete();
        }
      }
    });
  }

  filterAndDisplayMovies(movies: any[], container: string): void {
    movies.forEach((movie: any) => {
      this.service.getReleaseDates(movie.id).subscribe((releaseData: any) => {
        if (this.isIndonesianMovie(releaseData) || this.isIndonesianLanguage(movie)) {
          const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
          if (posterUrl && movie.poster_path) {
            const releaseYear = this.extractReleaseYear(releaseData);
            const movieData = {
              id: movie.id,
              title: movie.title,
              releaseYear: releaseYear,
              image: posterUrl,
              posterPath: posterUrl,
              modelItem: movie
            };

            if (container === 'initializeSliderContainer') {
              this.initializeSliderContainer.push(movieData);
            } else {
              this.appCardContainer.push({
                ...movieData,
                description: movie.overview,
                voterRating: this.formatRating(movie.vote_average)
              });
            }
          } else {
            console.warn('Poster URL is empty for movie:', movie);
          }
        }
      });
    });
  }

  isIndonesianMovie(releaseData: any): boolean {
    if (releaseData && releaseData.results) {
      const idRelease = releaseData.results.find((release: any) => release.iso_3166_1 === 'ID');
      return !!idRelease;
    }
    return false;
  }

  isIndonesianLanguage(movie: any): boolean {
    return movie.original_language === 'id';
  }

  extractReleaseYear(releaseData: any): string {
    if (releaseData && releaseData.results) {
      const idRelease = releaseData.results.find((release: any) => release.iso_3166_1 === 'ID');
      if (idRelease && idRelease.release_dates && idRelease.release_dates.length > 0) {
        const releaseDate = new Date(idRelease.release_dates[0].release_date);
        return releaseDate.getFullYear().toString();
      }
    }
    return 'N/A';
  }

  formatRating(voteAverage: number): string {
    return `${(voteAverage * 1).toFixed(1)}`;
  }

  genreSelectionChanged(event: any) {
    this.genreSelectedValue = event.detail.value;
    this.updateGenreLabel();
    this.page = 1;
    this.appCardContainer = [];
    this.filteredGenreId = this.genreSelectedValue.toString();
    this.loadPopularMovies();
  }

  updateGenreLabel() {
    if (this.genreSelectedValue.length > 0) {
      const selectedGenres = this.genreContainerList.filter(genre =>
        this.genreSelectedValue.includes(genre.id)
      );
      const genreNames = selectedGenres.map(genre => genre.name);
      this.genreLabel = genreNames.join(', ');
    } else {
      this.genreLabel = 'Film Populer';
    }
  }

  loadData(event: any) {
    this.page += 1;
    this.loadingCurrentEventData = event;
    this.loadPopularMovies();
  }

  async presentModal(modelItem: any) {
    console.log('Presenting modal for:', modelItem);
    const modal = await this.modalController.create({
      component: ModelPageComponent,
      componentProps: {
        modelItemList: modelItem,
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

  cardEventListener(modelItem: any) {
    console.log('Card event listener triggered for:', modelItem);
    forkJoin({
      detailResponse: this.service.getDetailList(modelItem.id),
      creditResponse: this.service.getCreditsList(modelItem.id),
      videoResponse: this.service.getVideoList(modelItem.id)
    }).subscribe({
      next: (response) => {
        modelItem.detailResponseEl = response.detailResponse;
        modelItem.creditsResponseEl = response.creditResponse;
        modelItem.videos = response.videoResponse;
        console.log('Data fetched for modal:', modelItem);
        this.presentModal(modelItem);
      },
      error: (err) => {
        console.error('Error fetching data', err);
      }
    });
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

  sliderClickEventTrigger(modelItem: any) {
    console.log('Slider item clicked:', modelItem);
    this.cardEventListener(modelItem);
  }

  initializeGenreContainer() {
    this.service.getGenreList().subscribe({
      next: (genreEl: any) => {
        if (genreEl && genreEl.genres) {
          console.log('Genres obtained:', genreEl.genres);
          this.genreContainerList = genreEl.genres;
        } else {
          console.error('Invalid genre data:', genreEl);
        }
      },
      error: (error: any) => {
        console.error('Error fetching genres:', error);
      }
    });
  }
}
