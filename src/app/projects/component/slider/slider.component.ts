import { AfterViewInit, Component, ViewChild, ElementRef, Input, Output, EventEmitter} from '@angular/core';
import Swiper from 'swiper';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SwiperComponent implements AfterViewInit {
  @Input() swiperContainerId = '';
  @Input() sliderInputValue: any[] = []; // Define the sliderInputValue
  index = 0;
  slidePerView = 1;

  @Output() itemClicked: EventEmitter<any> = new EventEmitter<any>(); 
  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      const shadowRoot = document.getElementById(this.swiperContainerId)?.getElementsByClassName('swiper')[0]?.shadowRoot?.firstElementChild as HTMLElement;
      shadowRoot?.style.setProperty('padding-bottom', '35px');
    }, 300);

    this.initializeSwiper();
  }

  initializeSwiper(): void {
    if (this.swiperContainer && this.swiperContainer.nativeElement) {
      const swiper = new Swiper(this.swiperContainer.nativeElement, {
        slidesPerView: 1,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          768: {
            slidesPerView: 2
          }
        }
      });
    } else {
      console.error('Swiper container element not found');
    }
  }

  sliderClickEventTrigger(modelItem: any): void {
    this.itemClicked.emit(modelItem);
    console.log('Slider item clicked:', modelItem); // Debugging log
  }


  changeSlide(prevOrNext: number): void {
    if (this.swiperContainer && this.swiperContainer.nativeElement && this.swiperContainer.nativeElement.swiper) {
      const swiperInstance = this.swiperContainer.nativeElement.swiper;
      if (prevOrNext === -1) {
        swiperInstance.slidePrev();
      } else {
        swiperInstance.slideNext();
      }
    }
  }
  
}
