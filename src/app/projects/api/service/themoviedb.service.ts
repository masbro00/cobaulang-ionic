import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { ModelPageComponent } from '../../component/model-page/model-page.component';

@Injectable({
  providedIn: 'root'
})
export class ThemoviedbService {
  private apiKey: string = `api_key=${environment.apiKey}`;
  private baseURL: string = 'https://api.themoviedb.org/3';
  private language: string = 'language=id-ID';
  private country: string = 'with_origin_country=ID';
  currentModal: any[] = [];

  constructor(private http: HttpClient) {}

  getGenreList(type: string): Observable<any> {
    const requestURL = `${this.baseURL}/genre/${type}/list?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getTrendingList(type: string): Observable<any> {
    const requestURL = `${this.baseURL}/discover/movie?${this.apiKey}&${this.language}&${this.country}&primary_release_year=2024`;
    return this.http.get(requestURL);
  }

  getPopularList(type: string, page: number, genres: string): Observable<any> {
    const requestURL = `${this.baseURL}/discover/movie?${this.apiKey}&${this.language}&${this.country}&page=${page}&with_genres=${genres}`;
    return this.http.get(requestURL);
  }

  getDetailList(type: string, id: string): Observable<any> {
    const requestURL = `${this.baseURL}/${type}/${id}?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getCreditsList(type: string, id: string): Observable<any> {
    const requestURL = `${this.baseURL}/${type}/${id}/credits?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getVideoList(type: string, id: string): Observable<any> {
    const requestURL = `${this.baseURL}/${type}/${id}/videos?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getRecommendationList(type: string, id: string): Observable<any> {
    const requestURL = `${this.baseURL}/${type}/${id}/recommendations?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getReleaseDates(movieId: string): Observable<any> {
    const url = `${this.baseURL}/movie/${movieId}/release_dates?${this.apiKey}&${this.language}`;
    return this.http.get(url);
  }
}



  