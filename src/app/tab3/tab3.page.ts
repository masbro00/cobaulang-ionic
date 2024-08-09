import { Component, OnInit } from '@angular/core';
import { ThemoviedbService } from '../projects/api/service/themoviedb.service';
import { ThemoviedbTvShowService } from '../projects/api/service/themoviedb-tvshow.service';
import { ModalController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { ModelPageComponent } from '../projects/component/model-page/model-page.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  searchValue: string = '';
  searchCardContainer: any[] = [];
  page: number = 1;
  loadingCurrentEventData: any;
  currentModal: any[] = [];
  isMovieSearch: boolean = true; // Flag untuk memilih antara pencarian film atau TV show

  constructor(
    private movieService: ThemoviedbService,
    private tvShowService: ThemoviedbTvShowService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    // Inisialisasi awal jika diperlukan
  }

  filterList() {
    this.page = 1;
    this.searchCardContainer = [];
    this.loadSearchResults();
  }

  loadSearchResults() {
    if (this.isMovieSearch) {
      this.movieService.getsearchMovies(this.searchValue, this.page).subscribe({
        next: (response: any) => {
          const filteredResults = response.results.filter((item: any) => {
            return item.original_language === 'id' || (item.origin_country && item.origin_country.includes('ID'));
          });

          const formattedResults = filteredResults.map((item: any) => ({
            id: item.id,
            title: item.title || item.name,
            image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'assets/img/poster.jpg',
            voterRating: item.vote_average.toFixed(1),
            releaseYear: item.release_date ? new Date(item.release_date).getFullYear().toString() : 'Unknown',
            modelItem: item
          }));

          this.searchCardContainer.push(...formattedResults);

          if (this.page > 1 && this.loadingCurrentEventData) {
            this.loadingCurrentEventData.target.complete();
            if (response.results.length === 0) {
              this.loadingCurrentEventData.target.disabled = true;
            }
          }
        },
        error: (error: any) => {
          console.error('Error fetching movies:', error);
          if (this.page > 1 && this.loadingCurrentEventData) {
            this.loadingCurrentEventData.target.complete();
          }
        }
      });
    } else {
      this.tvShowService.getsearchTVShows(this.searchValue, this.page).subscribe({
        next: (response: any) => {
          const filteredResults = response.results.filter((item: any) => {
            return item.original_language === 'id' || item.origin_country.includes('ID');
          });

          const formattedResults = filteredResults.map((item: any) => ({
            id: item.id,
            title: item.name || item.title,
            image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            voterRating: item.vote_average.toFixed(1),
            releaseYear: item.first_air_date ? new Date(item.first_air_date).getFullYear().toString() : 'Unknown',
            modelItem: item
          }));

          this.searchCardContainer.push(...formattedResults);

          if (this.page > 1 && this.loadingCurrentEventData) {
            this.loadingCurrentEventData.target.complete();
            if (response.results.length === 0) {
              this.loadingCurrentEventData.target.disabled = true;
            }
          }
        },
        error: (error: any) => {
          console.error('Error fetching TV shows:', error);
          if (this.page > 1 && this.loadingCurrentEventData) {
            this.loadingCurrentEventData.target.complete();
          }
        }
      });
    }
  }

  async presentModal(modelItem: any) {
    const modal = await this.modalController.create({
      component: ModelPageComponent,
      componentProps: {
        modelItemList: modelItem,
        modelType: this.isMovieSearch ? 'movie' : 'tv'
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
    const service = this.isMovieSearch ? this.movieService : this.tvShowService;

    forkJoin({
      detailResponse: service.getDetailList(modelItem.id),
      creditResponse: service.getCreditsList(modelItem.id),
      videoResponse: service.getVideoList(modelItem.id)
    }).subscribe({
      next: (response) => {
        modelItem.detailResponseEl = response.detailResponse;
        modelItem.creditsResponseEl = response.creditResponse;
        modelItem.videos = response.videoResponse;
        this.presentModal(modelItem);
      },
      error: (err) => {
        console.error('Error fetching data', err);
      }
    });
  }

  loadData(event: any) {
    this.page += 1;
    this.loadingCurrentEventData = event;
    this.loadSearchResults();
  }
}
