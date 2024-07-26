import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ThemoviedbService } from '../projects/api/service/themoviedb.service';
import { ThemoviedbTvShowService } from '../projects/api/service/themoviedb-tvshow.service';
import { forkJoin } from 'rxjs';
import { ModelPageComponent } from '../projects/component/model-page/model-page.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  searchValue: string = '';
  page: number = 1;
  searchCardContainer: any[] = [];
  loadingCurrentEventData: any;
  isVideoEnabled: boolean = false;

  constructor(
    private movieService: ThemoviedbService,
    private tvShowService: ThemoviedbTvShowService,
    private modalController: ModalController
  ) {}

  filterList() {
    this.page = 1;
    this.searchCardContainer = [];

    if (this.searchValue.length > 2) {
      this.loadSearchContainer();
    }
  }

  loadSearchContainer() {
    forkJoin([
      this.movieService.getsearchMovies(this.searchValue, this.page),
      this.tvShowService.getsearchTVShows(this.searchValue, this.page)
    ]).subscribe({
      next: ([movieResults, tvResults]) => {
        const combinedResults = [...movieResults.results, ...tvResults.results];
        this.searchCardContainer = combinedResults
          .filter((element: any) => element.original_language === 'id')
          .map((element: any) => ({
            title: element.title || element.original_name || 'Unknown Title',
            image: 'https://image.tmdb.org/t/p/w500/' + (element.poster_path || ''),
            modelItem: element,
            voterRating: this.formatRating(element.vote_average || 0),
            releaseYear: element.release_date ? new Date(element.release_date).getFullYear() : 'Unknown Year',
            media_type: element.media_type || 'unknown',
            id: element.id || 'unknown'
          }));

        if (this.page > 1 && this.loadingCurrentEventData) {
          this.loadingCurrentEventData.target.complete();
          if (this.searchCardContainer.length === 0) {
            this.loadingCurrentEventData.target.disabled = true;
          }
        }
      },
      error: error => {
        console.error('Error loading search container:', error);
      }
    });
  }

  formatRating(voteAverage: number): string {
    return `${(voteAverage * 10).toFixed(1)}`;
  }

  loadData(event: any) {
    this.page += 1;
    this.loadingCurrentEventData = event;
    this.loadSearchContainer();
  }

  async cardEventListener(modelItem: any) {
    console.log('Model Item:', modelItem);

    if (!modelItem || !modelItem.media_type || !modelItem.id) {
      console.error('Invalid media item:', modelItem);
      return;
    }

    this.isVideoEnabled = false;
    if (modelItem.media_type === 'movie') {
      this.fetchMovieDetails(modelItem);
    } else if (modelItem.media_type === 'tv') {
      this.fetchTVDetails(modelItem);
    } else {
      console.error('Unknown media type:', modelItem.media_type);
    }
  }

  private fetchMovieDetails(modelItem: any) {
    forkJoin([
      this.movieService.getDetailList('movie', modelItem.id),
      this.movieService.getCreditsList('movie', modelItem.id),
      this.movieService.getVideoList('movie', modelItem.id)
    ]).subscribe({
      next: ([detailResponse, creditResponse, videoResponse]) => {
        if (!detailResponse || !creditResponse || !videoResponse) {
          console.error('Incomplete response data', { detailResponse, creditResponse, videoResponse });
          return;
        }
        const modalData = this.prepareModalData(modelItem, {
          detailResponse,
          creditResponse,
          videoResponse
        });
        this.presentModal(modalData);
      },
      error: err => {
        console.error('Error fetching movie data:', err);
      }
    });
  }
  
  private fetchTVDetails(modelItem: any) {
    forkJoin([
      this.tvShowService.getDetailList(modelItem.id),
      this.tvShowService.getCreditsList(modelItem.id),
      this.tvShowService.getVideoList(modelItem.id)
    ]).subscribe({
      next: ([detailResponse, creditResponse, videoResponse]) => {
        if (!detailResponse || !creditResponse || !videoResponse) {
          console.error('Incomplete response data', { detailResponse, creditResponse, videoResponse });
          return;
        }
        const modalData = this.prepareModalData(modelItem, {
          detailResponse,
          creditResponse,
          videoResponse
        });
        this.presentModal(modalData);
      },
      error: err => {
        console.error('Error fetching TV data:', err);
      }
    });
  }

  private prepareModalData(modelItem: any, response: any) {
    return {
      title: modelItem.title || modelItem.original_name || 'Unknown Title',
      backgroundImage: 'https://image.tmdb.org/t/p/w500/' + (modelItem.backdrop_path || 'default.jpg'),
      videoUrl: response.videoResponse?.results?.length > 0 
        ? `https://www.youtube.com/embed/${response.videoResponse.results[0].key}` 
        : '',
      isVideoEnabled: this.isVideoEnabled,
      releasedate: modelItem.release_date ? new Date(modelItem.release_date).toLocaleDateString() : 'Unknown Release Date',
      runtime: response.detailResponse?.runtime 
        ? `${Math.floor(response.detailResponse.runtime / 60)}h ${response.detailResponse.runtime % 60}m` 
        : 'Unknown Runtime',
      voterRating: this.formatRating(modelItem.vote_average || 0),
      overview: modelItem.overview || 'No overview available',
      castItemList: response.creditResponse?.cast || [],
      crewItemList: response.creditResponse?.crew || [],
      appRecomendationsContainer: []
    };
  }

  async presentModal(data: any) {
    console.log('Presenting Modal with Data:', data);
    const modal = await this.modalController.create({
      component: ModelPageComponent,
      componentProps: data,
      cssClass: 'fullscreen-modal'
    });
    await modal.present();
  }
}
