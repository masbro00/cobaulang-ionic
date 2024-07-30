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

  getGenreList(): Observable<any> {
    const requestURL = `${this.baseURL}/genre/movie/list?${this.apiKey}&${this.language}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }

  getTrendingList(): Observable<any> {
    const url = `${this.baseURL}/trending/movie/week?${this.apiKey}&${this.language}&${this.country}`;
    console.log('API URL:', url);
    return this.http.get<any>(url);
  }

  getPopularList(page: number, genres: string): Observable<any> {
    const requestURL = `${this.baseURL}/discover/movie?${this.apiKey}&${this.language}&${this.country}&page=${page}&with_genres=${genres}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }

  getUpcomingList(page: number = 1): Observable<any> {
    const requestURL = `${this.baseURL}/movie/upcoming?${this.apiKey}&${this.language}&page=${page}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }

  getNowPlayingList(page: number = 1): Observable<any> {
    const requestURL = `${this.baseURL}/movie/now_playing?${this.apiKey}&${this.language}&page=${page}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }

  getTopRatedList(page: number = 1, genreId: string = ''): Observable<any> {
    let url = `${this.baseURL}/movie/top_rated?${this.apiKey}&${this.language}&page=${page}`;
    if (genreId) {
      url += `&with_genres=${genreId}`;
    }
    console.log('API URL:', url);
    return this.http.get(url);
  }

  getDetailList(id: string): Observable<any> {
    const requestURL = `${this.baseURL}/movie/${id}?${this.apiKey}&${this.language}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }

  getCreditsList(id: string): Observable<any> {
    const requestURL = `${this.baseURL}/movie/${id}/credits?${this.apiKey}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }

  getVideoList(id: string): Observable<any> {
    const requestURL = `${this.baseURL}/movie/${id}/videos?${this.apiKey}&${this.language}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }

  getRecommendationList(id: string): Observable<any> {
    const requestURL = `${this.baseURL}/movie/${id}/recommendations?${this.apiKey}&${this.language}&${this.country}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }

  getReleaseDates(id: string): Observable<any> {
    const url = `${this.baseURL}/movie/${id}/release_dates?${this.apiKey}`;
    console.log('API URL:', url);
    return this.http.get(url);
  }

  getsearchMovies(query: string, page: number): Observable<any> {
    const requestURL = `${this.baseURL}/search/movie?${this.apiKey}&${this.language}&${this.country}&page=${page}&query=${query}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }
}
