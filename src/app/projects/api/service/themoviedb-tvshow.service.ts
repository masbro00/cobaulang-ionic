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
    const url = `${this.baseURL}/trending/tv/week?${this.apiKey}&${this.language}&${this.country}`;
    console.log('API URL:', url); // Tambahkan log untuk memastikan URL API benar
    return this.http.get<any>(url);
  }
  
  getLatestReleases(): Observable<any> {
    const today = new Date().toISOString().split('T')[0]; // Format tanggal hari ini sebagai YYYY-MM-DD
    const url = `${this.baseURL}/discover/tv?${this.apiKey}&${this.language}&${this.country}&sort_by=first_air_date.desc&first_air_date.lte=${today}`;
    console.log('API URL:', url); // Tambahkan log untuk memastikan URL API benar
    return this.http.get<any>(url);
  }
  
  getOnTheAir(): Observable<any> {
    const url = `${this.baseURL}/tv/on_the_air?${this.apiKey}&${this.language}`;
    console.log('API URL:', url); // Tambahkan log untuk memastikan URL API benar
    return this.http.get<any>(url);
  }  

  getAiringToday(): Observable<any> {
    const url = `${this.baseURL}/tv/airing_today?${this.apiKey}&${this.language}`;
    console.log('API URL:', url); // Tambahkan log untuk memastikan URL API benar
    return this.http.get<any>(url);
  }  

  getPopularList(page: number, genres: string): Observable<any> {
    const requestURL = `${this.baseURL}/discover/tv?${this.apiKey}&${this.language}&${this.country}&page=${page}&with_genres=${genres}`;
    return this.http.get(requestURL);
  }

  getLatestList(page: number): Observable<any> {
    const url = `${this.baseURL}/tv/airing_today?${this.apiKey}&${this.language}&page=${page}`;
    return this.http.get(url);
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

  getReleaseDates(id: string): Observable<any> {
    const url = `${this.baseURL}/tv/${id}/release_dates?${this.apiKey}`;
    return this.http.get(url);
  }

  getSeasonDetails(tvShowId: string, seasonNumber: number): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${tvShowId}/season/${seasonNumber}?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getEpisodeDetails(tvShowId: string, seasonNumber: number, episodeNumber: number): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${tvShowId}/season/${seasonNumber}/episode/${episodeNumber}?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  getsearchTVShows(query: string, page: number): Observable<any> {
    const requestURL = `${this.baseURL}/search/tv?${this.apiKey}&${this.language}&${this.country}&page=${page}&query=${query}`;
    return this.http.get(requestURL);
  }
  
  getTVShowDetails(tvShowId: number): Observable<any> {
    const url = `${this.baseURL}/tv/${tvShowId}?${this.apiKey}&${this.language}`;
    return this.http.get<any>(url);
  }
  

}
