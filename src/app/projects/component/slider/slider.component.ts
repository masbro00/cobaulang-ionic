import { AfterViewInit, Component, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import Swiper from 'swiper'; // Import Swiper from swiper package

@Component({
  selector: 'app-slider', // Assuming 'app-slider' is the correct selector for your component
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SwiperComponent implements AfterViewInit {
  @Input() swiperContainerId = '';
  @Input() sliderInputValue: any[] = [];
  @Output() itemClicked: EventEmitter<any> = new EventEmitter<any>(); 
  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef;

  constructor() {}

  ngAfterViewInit(): void {
    this.initializeSwiper(); // Move initialization to ngAfterViewInit for proper timing

    // Adjusting styles should be done through Angular's renderer for better integration
    this.adjustSwiperStyles();
  }

  adjustSwiperStyles(): void {
    const swiperElement = this.swiperContainer.nativeElement;
    if (swiperElement) {
      const swiperWrapper = swiperElement.getElementsByClassName('swiper-wrapper')[0] as HTMLElement;
      if (swiperWrapper) {
        swiperWrapper.style.paddingBottom = '35px'; // Adjust padding-bottom directly
      }
    }
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
      console.error('Swiper container element not found or Swiper library not initialized');
    }
  }

  sliderClickEventTrigger(modelItem: any): void {
    this.itemClicked.emit(modelItem);
    console.log('Slider item clicked:', modelItem);
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
