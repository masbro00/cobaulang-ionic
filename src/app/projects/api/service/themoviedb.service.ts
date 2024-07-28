import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ThemoviedbService {
  private apiKey: string = `api_key=${environment.apiKey}`;
  private baseURL: string = 'https://api.themoviedb.org/3';
  private language: string = 'language=id-ID';
  private country: string = 'with_origin_country=ID';

  constructor(private http: HttpClient) {}

  getGenreList(type: string): Observable<any> {
    const requestURL = `${this.baseURL}/genre/${type}/list?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getTrendingList(type: string): Observable<any> {
    const requestURL = `${this.baseURL}/discover/movie?${this.apiKey}&${this.language}&${this.country}&sort_by=popularity.desc`;
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
    const requestURL = `${this.baseURL}/${type}/${id}/credits?${this.apiKey}`;
    return this.http.get(requestURL);
  }

  getVideoList(type: string, id: string): Observable<any> {
    const requestURL = `${this.baseURL}/${type}/${id}/videos?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getRecommendationList(type: string, id: string): Observable<any> {
    const requestURL = `${this.baseURL}/${type}/${id}/recommendations?${this.apiKey}&${this.language}&${this.country}`;
    return this.http.get(requestURL);
  }

  getReleaseDates(movieId: string): Observable<any> {
    const url = `${this.baseURL}/movie/${movieId}/release_dates?${this.apiKey}`;
    return this.http.get(url);
  }

  getsearchMovies(query: string, page: number): Observable<any> {
    const requestURL = `${this.baseURL}/search/movie?${this.apiKey}&${this.language}&${this.country}&page=${page}&query=${query}`;
    return this.http.get(requestURL);
  }

  getUpcomingList(type: string, page: number = 1): Observable<any> {
    const requestURL = `${this.baseURL}/${type}/upcoming?${this.apiKey}&${this.language}&page=${page}`;
    return this.http.get(requestURL);
  }

  getNowPlayingList(type: string, page: number = 1): Observable<any> {
    const requestURL = `${this.baseURL}/${type}/now_playing?${this.apiKey}&${this.language}&page=${page}`;
    return this.http.get(requestURL);
  }
  
  getTopRatedList(type: string, page: number = 1, genreId: string = ''): Observable<any> {
    let url = `${this.baseURL}/${type}/top_rated?${this.apiKey}&${this.language}&page=${page}`;
    if (genreId) {
      url += `&with_genres=${genreId}`;
    }
    return this.http.get(url);
  }  
  


}
