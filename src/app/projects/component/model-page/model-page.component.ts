import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, Renderer2, ElementRef } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { ThemoviedbService } from '../../api/service/themoviedb.service';
import { ThemoviedbTvShowService } from '../../api/service/themoviedb-tvshow.service';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-model-page',
  templateUrl: './model-page.component.html',
  styleUrls: ['./model-page.component.scss'],
})
export class ModelPageComponent implements OnInit, OnChanges {
  @Input() modelItemList: any;
  @Input() modelType!: 'movie' | 'tv';

  isLoading: boolean = true;
  id: string = '';
  title: string = '';
  backgroundImage: string = '';
  releasedate: string = '';
  overview: string = '';
  castItemList: any[] = [];
  crewItemList: any[] = [];
  runtime: string = ''; // Untuk TV Show, Anda mungkin ingin menampilkan durasi per episode
  voterRating: any;
  appRecomendationsContainer: any[] = [];
  isVideoEnabled: boolean = false;
  dangerousVideoUrl: string = '';
  videoUrl: any;

  constructor(
    private service: ThemoviedbService,
    private tvShowService: ThemoviedbTvShowService,
    private sanitizer: DomSanitizer,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private platform: Platform,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.initializeContainer();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['modelItemList']) {
      this.initializeContainer();
    }
  }

  initializeContainer() {
    if (this.modelItemList) {
      this.isLoading = true;
  
      this.title = this.modelType === 'movie' ? this.modelItemList.detailResponseEl.title : this.modelItemList.detailResponseEl.original_name;
      this.id = this.modelItemList.detailResponseEl.id || '';
      this.backgroundImage = this.modelItemList.detailResponseEl.backdrop_path
        ? 'https://image.tmdb.org/t/p/w500/' + this.modelItemList.detailResponseEl.backdrop_path
        : 'assets/img/bgnull.jpg';
  
      this.overview = this.modelItemList.detailResponseEl.overview ? this.modelItemList.detailResponseEl.overview : 'Sipnosis Tidak Tersedia.';
      console.log('Overview:', this.overview);
  
      this.releasedate = this.modelType === 'movie' ? this.modelItemList.detailResponseEl.release_date || '' : this.modelItemList.detailResponseEl.first_air_date || '';
  
      if (this.modelType === 'movie') {
        this.runtime = (this.modelItemList.detailResponseEl.runtime || '') + ' Menit';
      } else if (this.modelType === 'tv') {
        // TV Shows biasanya memiliki runtime per episode
        const runtime = this.modelItemList.detailResponseEl.episode_run_time;
        this.runtime = runtime && runtime.length > 0 ? runtime[0] + ' Menit' : 'Durasi tidak tersedia';
      }
  
      this.voterRating = 'Penilaian: ' + (Number(this.modelItemList.detailResponseEl.vote_average * 10).toFixed(2)) + '%';
  
      this.castItemList = this.modelItemList.creditsResponseEl?.cast.map((element: any) => ({
        ...element,
        profile_path: element.profile_path ? 'https://image.tmdb.org/t/p/w138_and_h175_face/' + element.profile_path : ''
      })) || [];
  
      this.crewItemList = this.modelItemList.creditsResponseEl?.crew.map((element: any) => ({
        ...element,
        profile_path: element.profile_path ? 'https://image.tmdb.org/t/p/w138_and_h175_face/' + element.profile_path : '',
        job: this.translateJob(element.job) // Menerjemahkan pekerjaan kru
      })) || [];
  
      this.isLoading = false;
      this.cdr.detectChanges();
  
      this.initializeRecomendationsContainer();
    }

    if (this.modelItemList?.videos?.results?.length > 0) {
      this.dangerousVideoUrl = 'https://www.youtube.com/embed/' + this.modelItemList.videos.results[0].key;
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.dangerousVideoUrl);
    }
  }

  initializeRecomendationsContainer() {
    let recommendationService;
    if (this.modelType === 'movie') {
      recommendationService = this.service.getRecommendationList.bind(this.service, this.id);
    } else if (this.modelType === 'tv') {
      recommendationService = this.tvShowService.getRecommendationList.bind(this.tvShowService, this.id);
    } else {
      console.error('modelType tidak valid');
      this.isLoading = false;
      return;
    }

    recommendationService().subscribe(responseEl => {
      this.appRecomendationsContainer = responseEl.results
        .filter((element: any) => element.original_language === 'id')
        .map((element: any) => ({
          title: this.modelType === 'movie' ? element.title : element.original_name,
          image: 'https://image.tmdb.org/t/p/w500/' + (element.backdrop_path || ''),
          modelItem: element,
          voterRating: 'Penilaian: ' + (Number(element.vote_average * 10).toFixed(2)) + '%',
          releaseYear: element.release_date ? new Date(element.release_date).getFullYear() : ''
        }));
      this.isLoading = false;
      this.cdr.detectChanges();
    }, error => {
      console.error('Error fetching recommendations:', error);
      this.isLoading = false;
    });
  }

  translateJob(job: string): string {
    const jobTranslation: { [key: string]: string } = {
      "Director": "Sutradara",
      "Producer": "Produser",
      "Creative Producer": "Produser Kreatif",
      "Line Producer": "Lini Produser",
      "Executive Producer": "Produser Eksekutif",
      "Screenplay": "Skenario",
      "Story": "Cerita",
      "Writer": "Penulis",
      "Cinematography": "Sinematografi",
      "Director of Photography": "Sutradara Fotografi",
      "Casting Director": "Sutradara Pemeranan",
      "Editor": "Editor",
      "Art Direction": "Arahan Seni",
      "Set Decoration": "Dekorasi Set",
      "Costume Design": "Desain Kostum",
      "Costume Designer": "Perancang Kostum",
      "Makeup Artist": "Penata Rias",
      "Makeup & Hair": "Perias",
      "Sound": "Suara",
      "Original Music Composer": "Komponis",
      "Sound Recordist": "Penanggung Jawab Suara",
      "Sound Designer": "Perancang Suara",
      "Visual Effects": "Efek Visual",
      "Special Effects": "Efek Khusus",
      "Casting": "Pemeran",
      "Music": "Musik",
      "Composer": "Komposer",
      "Comic Book": "Pembuat Komik",
      "Associate Producer": "Perancang Acara Madya",
      "Character Designer": "Perancang Karakter",
      "Concept Artist": "Perancang Ilustrasi",
      "Special Effects Makeup Artist": "Penata Rias Efek",
      "Visual Effects Supervisor": "Pengawas Efek Visual",
      "Music Director": "Musik Direktur",
      "First Assistant Director": "Asisten Sutradara",
      "Post Production Coordinator": "Koordinator Pasca Produksi",
      "Unit Production Manager": "Unit Manajer Produksi",
      "Stunt Double" : "Pemeran Pengganti",
      "Stunt Coordinator": "Koordinator Aksi",
      "Action Director": "Sutradara Aksi",
      "Fight Choreographer": "Koreografer Laga",
      "Rigging Supervisor": "Pengawas Juru Ikat",
      "Rigging Grip": "Juru Ikat",
      "Assistant Art Director": "Asisten Direktur Seni",
      "Assistant Set Decoration": "Asisten Dekorasi Set",
      "Set Dresser": "Penata Set Baju",
      "Property Master": "Master Properti",
      "Property Buyer": "Pembeli Properti Dekor",
      "Graphic Designer": "Desainer Grafis",
      "Art Department Assistant": "Asisten Divisi Ilustrasi",
      "On Set Props": "Pengawas Alat Peraga",
      "Draughtsman": "Juru Gambar",
      "Set Designer": "Perancang Set",
      "Construction Manager": "Manajer Konstruksi",
      "Conceptual Design": "Perancang Konsep",
      "Camera Operator": "Operator Kamera",
      "First Assistant B Camera" : "Asisten Kamera B",
      "Steadicam Operator" : "Operator Kamera Tetap",
      "Digital Imaging Technician": "Teknisi Gambar Digital",
      "Still Photographer": "Juru Foto",
      "BTS Videographer": "Perekam di Luar set",
      "Creative Director": "Sutrada Kreatif",
      "Production Coordinator": "Koordinator Produksi",
      "Finance": "Keuangan",
      "Production Assistant": "Asisten Produksi",
      "Production Runner": "Penyiap Kebutuhan Set",
      "Accountant": "Akuntan",
      "Head Designer": "Kepala Desainer",
      "Second Assistant Director": "Asisten Direktur",
      "Second Second Assistant Director": "Asisten Direktur",
      "Casting Associate": "Pencari Pemeran",
      "Casting Assistant": "Asisten Kasting",
      "Script Supervisor": "Pengawas Naskah",
      "Continuity": "Editor Penyambungan",
      "Clapper Loader": "Penyinkronan AudioVideo",
      "Sound Assistant": "Asisten Audio",
      "Assistant Gaffer": "Asisten Gaffer",
      "Lighting Technician": "Teknisi Pencahayaan",
      "Key Grip": "Kepala Pencahayaan",
      "Best Boy Grip": "Asisten Pencahayaan",
      "Assistant Grip": "Asisten Perkap Dekor",
      "Location Manager": "Manajer Lokasi",
      "Assistant Location Manager": "Asisten Manajer Lokasi",
      "Costume Supervisor": "Pengawas Set Kostum",
      "Assistant Costume Designer": "Asisten Desainer Kostum",
      "Key Set Costumer": "Perancang Set Kostum",
      "Seamstress": "Penjahit Kostum",
      "Assistant Makeup Artist": "Asisten Makeup",
      "Assistant Hairstylist": "Penata Rambut1",
      "Additional Hairstylist": "Penata Rambut2",
      "Data Management Technician": "Manajemen Data",
      "Assistant Editor": "Asisten Editor",
      "Translator": "Penerjemah",
      "Sound Re-Recording Mixer": "Penanggung Jawab Audio",
      "Dialogue Editor": "Dialog Editor",
      "Sound Effects Editor": "Editor Efek Suara",
      "ADR Mixer": "Pengulangan Rekaman",
      "Sound Post Production Coordinator": "Koordinator Produksi Suara",
      "Music Producer": "Produser Musik",
      "Scoring Mixer": "Penggabungan Track Audio",
      "Music Supervisor": "Pengawas Jalur Suara",
      "Orchestrator": "Orkestra",
      "Project Manager": "Manajer Projek",
      "Visual Effects Producer": "Produser Efek Visual",
      "VFX Production Coordinator": "Koordinator Efek Visual",
      "Visual Development": "Pengembang Visual",
      "VFX Editor": "Editor Efek Visual",
      "Pipeline Technical Director": "Direktur Teknis",
      "Compositing Lead": "Penggabung AudioVideo",

      // Tambahkan terjemahan pekerjaan lain yang diperlukan di sini
    };

    return jobTranslation[job] || job;
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  cardEventListener(modelItem: any) {
    this.isVideoEnabled = false;
    forkJoin({
      detailResponse: this.modelType === 'movie'
        ? this.service.getDetailList(modelItem.id)
        : this.tvShowService.getDetailList(modelItem.id),
      creditResponse: this.modelType === 'movie'
        ? this.service.getCreditsList(modelItem.id)
        : this.tvShowService.getCreditsList(modelItem.id),
      videoResponse: this.modelType === 'movie'
        ? this.service.getVideoList(modelItem.id)
        : this.tvShowService.getVideoList(modelItem.id)
    }).subscribe({
      next: response => {
        modelItem.detailResponseEl = response.detailResponse;
        modelItem.creditsResponseEl = response.creditResponse;
        modelItem.videos = response.videoResponse;
        this.presentModal(modelItem);
      },
      error: err => {
        console.error('Error fetching data', err);
      }
    });
  }

  async presentModal(modelItem: any) {
    const modal = await this.modalController.create({
      component: ModelPageComponent,
      componentProps: {
        modelItemList: modelItem,
        modelType: this.modelType,
      },
      cssClass: 'fullscreen-modal',
      backdropDismiss: false
    });
    console.log(modal);
    await modal.present();
  }

  playVideo() {
    this.isVideoEnabled = true;
  }
}
