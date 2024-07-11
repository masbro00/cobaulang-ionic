import { Component, OnInit } from '@angular/core';
import { ThemoviedbService } from '../projects/api/service/themoviedb.service';

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

  constructor(private service: ThemoviedbService) {}

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
          this.appCardContainer.push({
            id: element.id,
            title: element.title,
            description: element.overview,
            release: element.release_date,
            image: posterUrl,
            voterRating: element.vote_average,
            modelItem: element
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
}
