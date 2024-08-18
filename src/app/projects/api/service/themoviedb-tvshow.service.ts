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

  // Mendapatkan daftar genre TV
  getGenreList(): Observable<any> {
    const requestURL = `${this.baseURL}/genre/tv/list?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  // Mendapatkan daftar trending TV shows
  getTrendingList(): Observable<any> {
    const url = `${this.baseURL}/trending/tv/week?${this.apiKey}&${this.language}&${this.country}`;
    console.log('API URL:', url); 
    return this.http.get<any>(url);
  }
  
  // Mendapatkan TV shows terbaru berdasarkan tanggal rilis
  getLatestReleases(): Observable<any> {
    const today = new Date().toISOString().split('T')[0]; // Format tanggal hari ini sebagai YYYY-MM-DD
    const url = `${this.baseURL}/discover/tv?${this.apiKey}&${this.language}&${this.country}&sort_by=first_air_date.desc&first_air_date.lte=${today}`;
    console.log('API URL:', url); 
    return this.http.get<any>(url);
  }
  
  // Mendapatkan TV shows yang sedang tayang
  getOnTheAir(): Observable<any> {
    const url = `${this.baseURL}/tv/on_the_air?${this.apiKey}&${this.language}`;
    console.log('API URL:', url); 
    return this.http.get<any>(url);
  }  

  // Mendapatkan TV shows yang tayang hari ini
  getAiringToday(): Observable<any> {
    const url = `${this.baseURL}/tv/airing_today?${this.apiKey}&${this.language}`;
    console.log('API URL:', url); 
    return this.http.get<any>(url);
  }  

  // Mendapatkan daftar TV shows populer berdasarkan genre
  getPopularList(page: number, genres: string): Observable<any> {
    const requestURL = `${this.baseURL}/discover/tv?${this.apiKey}&${this.language}&${this.country}&page=${page}&with_genres=${genres}`;
    return this.http.get(requestURL);
  }

  // Mendapatkan daftar TV shows yang terbaru (sedang tayang hari ini)
  getLatestList(page: number): Observable<any> {
    const url = `${this.baseURL}/tv/airing_today?${this.apiKey}&${this.language}&page=${page}`;
    return this.http.get(url);
  }

  // Mendapatkan detail TV show berdasarkan ID
  getDetailList(id: string): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${id}?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  // Mendapatkan daftar credits (pemeran dan kru) dari sebuah TV show
  getCreditsList(id: string): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${id}/credits?${this.apiKey}`;
    return this.http.get(requestURL);
  }

  // Mendapatkan daftar video terkait (seperti trailer) dari sebuah TV show
  getVideoList(id: string): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${id}/videos?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  // Mendapatkan daftar rekomendasi TV show berdasarkan ID TV show tertentu
  getRecommendationList(id: string): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${id}/recommendations?${this.apiKey}&${this.language}&${this.country}`;
    return this.http.get(requestURL);
  }

  // Mendapatkan tanggal rilis untuk sebuah TV show berdasarkan ID
  getReleaseDates(id: string): Observable<any> {
    const url = `${this.baseURL}/tv/${id}/release_dates?${this.apiKey}`;
    return this.http.get(url);
  }

  // Mendapatkan detail musim dari sebuah TV show berdasarkan ID TV show dan nomor musim
  getSeasonDetails(tvShowId: string, seasonNumber: number): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${tvShowId}/season/${seasonNumber}?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }

  // Mendapatkan detail episode dari sebuah TV show berdasarkan ID TV show, nomor musim, dan nomor episode
  getEpisodeDetails(tvShowId: string, seasonNumber: number, episodeNumber: number): Observable<any> {
    const requestURL = `${this.baseURL}/tv/${tvShowId}/season/${seasonNumber}/episode/${episodeNumber}?${this.apiKey}&${this.language}`;
    return this.http.get(requestURL);
  }
  
  // Mendapatkan detail lengkap dari sebuah TV show berdasarkan ID
  getTVShowDetails(tvShowId: number): Observable<any> {
    const url = `${this.baseURL}/tv/${tvShowId}?${this.apiKey}&${this.language}`;
    return this.http.get<any>(url);
  }

  getPopularTVShowsByYearRange(page: number, genres: string): Observable<any> {
    const currentYear = new Date().getFullYear();
    const requestURL = `${this.baseURL}/discover/tv?${this.apiKey}&${this.language}&${this.country}&sort_by=popularity.desc&first_air_date.gte=2020-01-01&first_air_date.lte=${currentYear}-12-31&page=${page}&with_genres=${genres}`;
    
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }  

  // Melakukan pencarian TV show berdasarkan query dan halaman
  getsearchTVShows(query: string, page: number): Observable<any> {
    const requestURL = `${this.baseURL}/search/tv?${this.apiKey}&${this.language}&page=${page}&query=${query}`;
    console.log('API URL:', requestURL);
    return this.http.get(requestURL);
  }
  
}
