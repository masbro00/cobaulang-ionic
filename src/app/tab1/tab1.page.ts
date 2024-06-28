import { Component, OnInit } from '@angular/core';
import { ThemoviedbService } from '../projects/api/service/themoviedb.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  modelType: string = 'movie'; // Deklarasi modelType dengan nilai default
  initializeSliderContainer: any[] = []; // Inisialisasi sebagai array
  swiperContainerId: string = 'swiper-container';

  constructor(private service: ThemoviedbService) {}

  ngOnInit(): void {
    this.loadTrendingMovies(); // Memperbaiki nama fungsi agar lebih deskriptif
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
}
