import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ThemoviedbTvShowService {
  private apiKey: string = `api_key=${environment.apiKey}`;
  private baseURL: string = 'https://api.themoviedb.org/3';
  private language: string = 'language=id-ID';
  private country: string = 'with_origin_country=ID';

  constructor(private http: HttpClient) {}

  getGenreList(): Observable<any> {
    const requestURL = `${this.baseURL}/genre/tv/list?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getTrendingList(): Observable<any> {
    const requestURL = `${this.baseURL}/trending/tv/week?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }  

  getPopularList(page: number, genres: string): Observable<any> {
    const requestURL = `${this.baseURL}/discover/tv?${this.apiKey}&${this.language}&${this.country}&page=${page}&with_genres=${genres}`;
    return this.http.get(requestURL);
  }

  getDetailList(id: string): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${id}?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getCreditsList(id: string): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${id}/credits?${this.apiKey}`;
    return this.http.get(requestURL);
  }

  getVideoList(id: string): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${id}/videos?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getRecommendationList(id: string): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${id}/recommendations?${this.apiKey}&${this.language}&${this.country}`;
    return this.http.get(requestURL);
  }

  getSeasonDetails(tvShowId: string, seasonNumber: number): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${tvShowId}/season/${seasonNumber}?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getEpisodeDetails(tvShowId: string, seasonNumber: number, episodeNumber: number): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${tvShowId}/season/${seasonNumber}/episode/${episodeNumber}?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }
}
