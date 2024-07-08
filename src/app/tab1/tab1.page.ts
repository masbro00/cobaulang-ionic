import { Component, OnInit } from '@angular/core';
import { ThemoviedbService } from '../projects/api/service/themoviedb.service';
import { initialize } from '@ionic/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  modelType: string = 'movie'; // Deklarasi modelType dengan nilai default
  initializeSliderContainer: any[] = []; // Inisialisasi sebagai array
  swiperContainerId: string = 'swiper-container';
  genreContainerList: any = [];
  page: number = 1; // Inisialisasi page dengan nilai default
  genreSelectedValue: any = []; // Deklarasi genreSelectedValue
  filteredGenreId: string = ''; // Inisialisasi filteredGenreId dengan nilai default
  appCardContainer: any = [];

  constructor(private service: ThemoviedbService) {}

  ngOnInit(): void {
    this.loadTrendingMovies(); // Memperbaiki nama fungsi agar lebih deskriptif
    this.initializeGenreContainer();
    this.initializePopularContainer();
  }

  loadTrendingMovies() {
    this.service.getTrendingList(this.modelType).subscribe(
      (trendingMoviesEl: any) => {
        trendingMoviesEl.results.forEach((trendingMovie: any) => {
          const posterUrl = `https://image.tmdb.org/t/p/w500${trendingMovie.poster_path}`;
          this.initializeSliderContainer.push({
            id: trendingMovie.id,
            title: trendingMovie.title,
            release: trendingMovie.release_date,
            image: posterUrl,
            posterPath: posterUrl,
            modelItem: trendingMovie
          });
        });
      },
      (error: any) => {
        console.error('Error fetching trending movies:', error);
      }
    );
  }

  sliderClickEventTrigger(modelValue: any) {
    // Tambahkan logika untuk menangani klik slider di sini
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
        if (genreEl && genreEl.genres) { // Mengubah dari genre menjadi genres
          console.log('Genres obtained:', genreEl.genres); // Tambahkan log ini
          genreEl.genres.forEach((genreElement: any) => { // Mengubah dari genre menjadi genres
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

  initializePopularContainer() {
    this.page= 1;
    this.filteredGenreId = '';
    this.service.getPopularList(this.modelType, this.page, this.filteredGenreId).subscribe(
      (popularMoviesEl: any) => {
        popularMoviesEl.results.forEach((element: any) => {
          const posterUrl = `https://image.tmdb.org/t/p/w500${element.poster_path}`;
          this.appCardContainer.push({
            id: element.id,
            title: element.title,
            description: element.overview,
            release: element.release_date,
            image: posterUrl,
            voterRating: element.voter_average,
            modelItem: element
          });
        });
      },
      (error: any) => {
        console.error('Error fetching popular movies:', error);
      }
    );
  }

  genreSelectionChanged(event: any) {
    this.genreSelectedValue = event.detail.value;
    // Tambahkan logika tambahan yang diperlukan untuk menangani perubahan genre di sini
  }
}
