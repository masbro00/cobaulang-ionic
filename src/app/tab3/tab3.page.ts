import { Component } from '@angular/core';
import { ThemoviedbService } from '../projects/api/service/themoviedb.service';
import { forkJoin } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { ModelPageComponent } from '../projects/component/model-page/model-page.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  searchValue: string;
  page: number;
  searchCardContainer: any[] = [];
  loadingCurrentEventData: any;
  isVideoEnabled: boolean;

  constructor(private service: ThemoviedbService, private modalController: ModalController) {
    this.searchValue = '';
    this.page = 1;
    this.isVideoEnabled = false;
  }

  filterList() {
    this.page = 1;
    this.searchCardContainer = [];

    if (this.searchValue.length > 2) {
      this.loadSearchContainer();
    }
  }

  loadSearchContainer() {
    forkJoin({
      movieResults: this.service.getsearchMovies(this.searchValue, this.page),
      tvResults: this.service.getsearchTVShows(this.searchValue, this.page)
    }).subscribe(results => {
      const combinedResults = [...results.movieResults.results, ...results.tvResults.results];
      this.searchCardContainer = combinedResults
        .filter((element: any) => element.original_language === 'id')
        .map((element: any) => ({
          title: element.title || element.original_name,
          image: 'https://image.tmdb.org/t/p/w500/' + (element.poster_path || ''),
          modelItem: element,
          voterRating: this.formatRating(element.vote_average),
          releaseYear: element.release_date ? new Date(element.release_date).getFullYear() : '',
          media_type: element.media_type || 'unknown' // Menambahkan media_type untuk debugging
        }));

      if (this.page > 1 && this.loadingCurrentEventData) {
        this.loadingCurrentEventData.target.complete();
        if (this.searchCardContainer.length === 0) {
          this.loadingCurrentEventData.target.disabled = true;
        }
      }
    }, error => {
      console.error('Error loading search container:', error);
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
    console.log('Model Item:', modelItem); // Log modelItem for debugging

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
    forkJoin({
      detailResponse: this.service.getDetailList('movie', modelItem.id),
      creditResponse: this.service.getCreditsList('movie', modelItem.id),
      videoResponse: this.service.getVideoList('movie', modelItem.id)
    }).subscribe({
      next: response => {
        const modalData = this.prepareModalData(modelItem, response);
        this.presentModal(modalData);
      },
      error: err => {
        console.error('Error fetching movie data:', err);
      }
    });
  }

  private fetchTVDetails(modelItem: any) {
    forkJoin({
      detailResponse: this.service.getDetailList('tv', modelItem.id),
      creditResponse: this.service.getCreditsList('tv', modelItem.id),
      videoResponse: this.service.getVideoList('tv', modelItem.id)
    }).subscribe({
      next: response => {
        const modalData = this.prepareModalData(modelItem, response);
        this.presentModal(modalData);
      },
      error: err => {
        console.error('Error fetching TV data:', err);
      }
    });
  }

  private prepareModalData(modelItem: any, response: any) {
    return {
      title: modelItem.title || modelItem.original_name,
      backgroundImage: 'https://image.tmdb.org/t/p/w500/' + (modelItem.backdrop_path || ''),
      videoUrl: response.videoResponse.results.length > 0 ? `https://www.youtube.com/embed/${response.videoResponse.results[0].key}` : '',
      isVideoEnabled: this.isVideoEnabled,
      releasedate: modelItem.release_date ? new Date(modelItem.release_date).toLocaleDateString() : '',
      runtime: response.detailResponse.runtime ? `${Math.floor(response.detailResponse.runtime / 60)}h ${response.detailResponse.runtime % 60}m` : '',
      voterRating: this.formatRating(modelItem.vote_average),
      overview: modelItem.overview,
      castItemList: response.creditResponse.cast,
      crewItemList: response.creditResponse.crew,
      appRecomendationsContainer: [] // Populate with recommendations if available
    };
  }

  async presentModal(data: any) {
    console.log('Presenting Modal with Data:', data); // Log data for debugging
    const modal = await this.modalController.create({
      component: ModelPageComponent,
      componentProps: data,
      cssClass: 'fullscreen-modal' // Optional: Customize CSS class for fullscreen modal
    });
    return await modal.present();
  }
}
