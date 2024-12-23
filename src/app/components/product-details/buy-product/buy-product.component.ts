import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ProductService } from '../../product/product.service';
import { DropdownModule } from 'primeng/dropdown';
import { Button, ButtonModule } from 'primeng/button';
import { EventService } from '../../event/event.service';
import { EventOverviewDTO } from '../../event/event-overview-dto';

@Component({
  selector: 'app-buy-product',
  standalone: true,
  imports: [DropdownModule, ButtonModule],
  templateUrl: './buy-product.component.html',
  styleUrl: './buy-product.component.scss'
})
export class BuyProductComponent implements OnInit {
  @Input() productId!: number;
  @Output() productBought = new EventEmitter<string>();
  eventId: number = -1;
  events: EventOverviewDTO[] = [];

  constructor(private productService: ProductService, private eventService: EventService) {}
  
  ngOnInit() {
      this.eventService.getByEo(1).subscribe({
        next: (response) => {
          this.events = response;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  onEventChange(event: any) {
    const selectedEventId = event.value?.id;
    this.eventId = selectedEventId;
    console.log(this.eventId);
  }

  onSubmit() {
    this.productService.buyProduct(this.productId, this.eventId).subscribe({
      next: (response) => {
        this.productBought.emit(response.message);
      },
      error: (err) => {
        this.productBought.emit(err.error.message);
      }
    });
  }
}
