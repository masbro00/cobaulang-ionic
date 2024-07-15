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
  initializeSliderContainer: any[] = [];
  swiperContainerId: string = 'swiper-container';
  genreContainerList: any[] = [];
  page: number = 1;
  genreSelectedValue: any = [];
  filteredGenreId: string = '';
  appCardContainer: any[] = [];
  loadingCurrentEventData: any;
  currentModal: any[] = []; // Array untuk melacak modal yang sedang ditampilkan

  constructor(
    private service: ThemoviedbService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.loadTrendingMovies();
    this.initializeGenreContainer();
    this.loadPopularMovies();
  }

  loadTrendingMovies() {
    this.service.getTrendingList(this.modelType).subscribe(
      (trendingMoviesEl: any) => {
        trendingMoviesEl.results.forEach((trendingMovie: any) => {
          const posterUrl = `https://image.tmdb.org/t/p/w500${trendingMovie.poster_path}`;
          this.service.getReleaseDates(trendingMovie.id).subscribe((releaseData: any) => {
            const releaseYear = this.extractReleaseYear(releaseData);
            this.initializeSliderContainer.push({
              id: trendingMovie.id,
              title: trendingMovie.title,
              releaseYear: releaseYear, // Perbaiki konsistensi nama variabel
              image: posterUrl,
              posterPath: posterUrl,
              modelItem: trendingMovie
            });
          });
        });
      },
      (error: any) => {
        console.error('Error fetching trending movies:', error);
      }
    );
  }
  

  sliderClickEventTrigger(modelValue: any) {
    console.log('Slider clicked:', modelValue);
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

  initializeGenreContainer() {
    this.service.getGenreList(this.modelType).subscribe(
      (genreEl: any) => {
        if (genreEl && genreEl.genres) {
          console.log('Genres obtained:', genreEl.genres);
          genreEl.genres.forEach((genreElement: any) => {
            this.genreContainerList.push(genreElement);
          });
        } else {
          console.error('Invalid genre data:', genreEl);
        }
      },
      (error: any) => {
        console.error('Error fetching genres:', error);
      }
    );
  }

  loadPopularMovies() {
    this.service.getPopularList(this.modelType, this.page, this.filteredGenreId).subscribe(
      (popularMoviesEl: any) => {
        popularMoviesEl.results.forEach((element: any) => {
          const posterUrl = `https://image.tmdb.org/t/p/w500${element.poster_path}`;
          this.service.getReleaseDates(element.id).subscribe(releaseData => {
            const releaseYear = this.extractReleaseYear(releaseData);
            this.appCardContainer.push({
              id: element.id,
              title: element.title,
              description: element.overview,
              releaseYear: releaseYear, // Pastikan ini diatur
              image: posterUrl,
              voterRating: element.vote_average.toFixed(1),
              modelItem: element
            });
          });
        });
  
        if (this.page > 1 && this.loadingCurrentEventData) {
          this.loadingCurrentEventData.target.complete();
          if (popularMoviesEl.results.length === 0) {
            this.loadingCurrentEventData.target.disabled = true;
          }
        }
      },
      (error: any) => {
        console.error('Error fetching popular movies:', error);
        if (this.page > 1 && this.loadingCurrentEventData) {
          this.loadingCurrentEventData.target.complete();
        }
      }
    );
  }
  
  
  

  extractReleaseYear(releaseData: any): string {
    console.log('Release data:', releaseData); // Log untuk melihat data yang diterima
    if (releaseData && releaseData.results) {
      const idRelease = releaseData.results.find((release: any) => release.iso_3166_1 === 'ID');
      if (idRelease && idRelease.release_dates && idRelease.release_dates.length > 0) {
        const releaseDate = new Date(idRelease.release_dates[0].release_date);
        return releaseDate.getFullYear().toString();
      }
    }
    return 'N/A';
  }
  

  genreSelectionChanged(event: any) {
    const genreEl = event.detail.value;
    if (genreEl.length > 0 || this.filteredGenreId != null) {
      this.page = 1;
      this.appCardContainer = [];
      this.filteredGenreId = genreEl.toString();
      this.loadPopularMovies();
    }
  }

  loadData(event: any) {
    this.page += 1;
    this.loadingCurrentEventData = event;
    this.loadPopularMovies();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModelPageComponent,
      componentProps: {
        title: 'Modal Title' // Tentukan judul modal jika diperlukan
      }
    });
    await modal.present();
    this.currentModal.push(modal); // Tambahkan modal ke array currentModal
  }

  async dismissModal() {
    if (this.currentModal.length > 0) {
      const modal = this.currentModal.pop(); // Ambil modal terbaru dari array
      await modal.dismiss(); // Tutup modal
    }
  }

  cardEventListener(modelItem: any) {
    forkJoin({
      detailResponse: this.service.getDetailList(this.modelType, modelItem.id),
      creditResponse: this.service.getCreditsList(this.modelType, modelItem.id),
      videoResponse: this.service.getVideoList(this.modelType, modelItem.id)
    }).subscribe({
      next: response => {
        modelItem.detailResponse = response.detailResponse;
        modelItem.creditResponse = response.creditResponse;
        modelItem.videos = response.videoResponse;
        this.presentModal(); // Panggil presentModal setelah mendapatkan data
      },
      error: err => {
        console.error('Error fetching data', err);
        // Tangani kesalahan di sini
      }
    });
  }
}
