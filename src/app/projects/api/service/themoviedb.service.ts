import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { map } from 'rxjs/operators';

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

  getTrendingList(page: number): Observable<any> {
    const requestURL = `${this.baseURL}/trending/movie/week?${this.apiKey}&${this.language}&${this.country}&page=${page}`;
    console.log('API URL:', requestURL);
    return this.http.get<any>(requestURL);
  }

  getPopularList(page: number, genres: string): Observable<any> {
    const requestURL = `${this.baseURL}/discover/movie?${this.apiKey}&${this.language}&${this.country}&page=${page}&with_genres=${genres}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }

  getUpcomingList(page: number, genres: string): Observable<any> {
    const requestURL = `${this.baseURL}/movie/upcoming?${this.apiKey}&${this.language}&${this.country}&page=${page}&with_genres=${genres}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }

  getNowPlayingList(page: number, genres: string): Observable<any> {
    const requestURL = `${this.baseURL}/movie/now_playing?${this.apiKey}&${this.language}&${this.country}&page=${page}&with_genres=${genres}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }

  getTopRatedList(page: number, genres: string): Observable<any> {
    const requestURL = `${this.baseURL}/movie/top_rated?${this.apiKey}&${this.language}&${this.country}&page=${page}&with_genres=${genres}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
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
    const requestURL = `${this.baseURL}/movie/${id}/release_dates?${this.apiKey}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }

  getPopularMoviesByYearRange(page: number, genres: string): Observable<any> {
    const currentYear = new Date().getFullYear();
    const requestURL = `${this.baseURL}/discover/movie?${this.apiKey}&${this.language}&${this.country}&sort_by=popularity.desc&primary_release_date.gte=2024-09-1&primary_release_date.lte=${currentYear}-10-31&page=${page}&with_genres=${genres}`;
    
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }
  

  getSearchMovies(query: string, page: number): Observable<any> {
    const requestURL = `${this.baseURL}/search/movie?${this.apiKey}&${this.language}&${this.country}&page=${page}&query=${query}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }
}
