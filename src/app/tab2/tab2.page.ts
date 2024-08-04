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
  modelType: string = 'tv'; // Mengganti dari 'movie' ke 'tv'
  initializeSliderContainer: any[] = [];  // Untuk acara TV di slider
  swiperContainerId: string = 'swiper-container';
  genreContainerList: any[] = [];
  page: number = 1;
  genreSelectedValue: any = [];
  filteredGenreId: string = '';
  appCardContainer: any[] = [];  // Untuk acara TV di card
  filteredAppCardContainer: any[] = []; // Untuk acara TV yang sudah difilter
  loadingCurrentEventData: any;
  currentModal: any[] = [];
  genreLabel: string = 'Acara TV Populer';
  searchTerm: string = ''; // Properti untuk menyimpan nilai pencarian

  constructor(
    private tvShowService: ThemoviedbTvShowService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.loadLatestReleases(); // Memuat rilis terbaru
    this.initializeGenreContainer();
    this.loadPopularTVShows();
  }

  loadLatestReleases(): void {
    this.tvShowService.getLatestReleases().subscribe(
      (latestTVShowsEl: any) => {
        this.filterAndDisplayTVShows(latestTVShowsEl.results, 'initializeSliderContainer');
      },
      (error: any) => {
        console.error('Error fetching latest TV shows for slider:', error);
      }
    );
  }

  loadPopularTVShows(): void {
    this.tvShowService.getPopularList(this.page, this.filteredGenreId).subscribe({
      next: (popularTVShowsEl: any) => {
        this.filterAndDisplayTVShows(popularTVShowsEl.results, 'appCardContainer');
      },
      error: (error: any) => {
        console.error('Error fetching popular TV shows:', error);
      },
      complete: () => {
        if (this.loadingCurrentEventData && this.loadingCurrentEventData.target) {
          this.loadingCurrentEventData.target.complete();
        }
      }
    });
  }

  filterAndDisplayTVShows(tvShows: any[], container: string): void {
    tvShows.forEach((tvShow: any) => {
      let posterUrl = `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`;

      // Jika tidak ada poster_path, gunakan gambar default
      if (!tvShow.poster_path) {
        posterUrl = 'assets/img/poster.jpg';
      }

      const tvShowData = {
        id: tvShow.id,
        title: tvShow.name,
        releaseYear: this.extractReleaseYear(tvShow),
        image: posterUrl,
        posterPath: posterUrl,
        modelItem: tvShow
      };

      if (container === 'initializeSliderContainer') {
        this.initializeSliderContainer.push(tvShowData);
      } else {
        this.appCardContainer.push({
          ...tvShowData,
          description: tvShow.overview,
          voterRating: this.formatRating(tvShow.vote_average)
        });
      }

      // Filter TV shows based on search term
      this.filterTVShows();
    });
  }

  extractReleaseYear(tvShow: any): string {
    // Gunakan tahun rilis dari data tvShow
    if (tvShow.first_air_date) {
      const releaseDate = new Date(tvShow.first_air_date);
      return releaseDate.getFullYear().toString();
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
    this.loadPopularTVShows();
  }

  updateGenreLabel() {
    if (this.genreSelectedValue.length > 0) {
      const selectedGenres = this.genreContainerList.filter(genre =>
        this.genreSelectedValue.includes(genre.id)
      );
      const genreNames = selectedGenres.map(genre => genre.name);
      this.genreLabel = genreNames.join(', ');
    } else {
      this.genreLabel = 'Acara TV Populer';
    }
  }

  loadData(event: any) {
    this.page += 1;
    this.loadingCurrentEventData = event;
    this.loadPopularTVShows();
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
      detailResponse: this.tvShowService.getDetailList(modelItem.id),
      creditResponse: this.tvShowService.getCreditsList(modelItem.id),
      videoResponse: this.tvShowService.getVideoList(modelItem.id)
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
    this.tvShowService.getGenreList().subscribe({
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

  // Method for handling search input
  onSearchInput(event: any) {
    this.searchTerm = event.target.value;
    this.filterTVShows();
  }

  // Method to filter TV shows based on search term
  filterTVShows() {
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      this.filteredAppCardContainer = this.appCardContainer.filter(item => 
        item.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredAppCardContainer = [...this.appCardContainer];
    }
  }

  onGenreClick(event: MouseEvent) {
    // Nonaktifkan pointer-events pada slider
    const swiperContainer = document.getElementById(this.swiperContainerId);
    if (swiperContainer) {
      swiperContainer.style.pointerEvents = 'none';
    }

    // Kembalikan pointer-events setelah beberapa waktu
    setTimeout(() => {
      if (swiperContainer) {
        swiperContainer.style.pointerEvents = 'auto';
      }
    }, 200); // Atur waktu sesuai kebutuhan

    event.stopPropagation(); // Menghentikan propagasi klik pada elemen lain
  }
}
