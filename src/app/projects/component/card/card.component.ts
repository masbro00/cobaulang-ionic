import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() title: string = ''; // Memberikan nilai default
  @Input() image: string = ''; // Memberikan nilai default
  @Input() voterRating: string = ''; // Memberikan nilai default
  @Input() model: any = {}; // Memberikan nilai default
  @Input() year: number = new Date().getFullYear();
  @Output() cardEventTrigger: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  cardClickEventTrigger(model: any) {
    this.cardEventTrigger.emit(model);
  }
}
