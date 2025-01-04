import { Component, OnInit } from '@angular/core';
import { MerchandiseDetailDTO } from '../merchandise/merchandise-detail-dto';
import { ActivatedRoute } from '@angular/router';
import { MerchandiseService } from '../merchandise/merchandise.service';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { CurrencyPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { FieldsetModule } from 'primeng/fieldset';
import { DialogModule } from 'primeng/dialog';
import { ProductService } from '../product/product.service';
import { BuyProductComponent } from "./buy-product/buy-product.component";
import { Router } from '@angular/router';
import { JwtService } from '../auth/jwt.service';
import { MapComponent } from '../map/map.component';
import { MapService } from '../map/map.service';
import { LeaveReviewComponent } from "../leave-review/leave-review.component";

@Component({
  selector: 'app-prodcut-details',
  standalone: true,
  imports: [PaginatorModule, ButtonModule, CurrencyPipe, CommonModule, GalleriaModule, FieldsetModule, MapComponent, DialogModule, BuyProductComponent, LeaveReviewComponent],
  templateUrl: './prodcut-details.component.html',
  styleUrl: './prodcut-details.component.scss'
})
export class ProdcutDetailsComponent implements OnInit {
  productId: number = -1;
  eventId: number = -1;
  displayEventSearch = false;
  displayPopupMessage = false;
  popupMessage = '';
  product: MerchandiseDetailDTO | null = null;
  isStarFilled: boolean = false;
  role: string = '';

  images: any[] = [];
  paginatedReviews: any | undefined;
  responsiveOptions: any[] = [
      {
          breakpoint: '991px',
          numVisible: 4
      },
      {
          breakpoint: '767px',
          numVisible: 3
      },
      {
          breakpoint: '575px',
          numVisible: 1
      }
  ];
  
    constructor(private route: ActivatedRoute,
                private router: Router, 
                private merchandiseService: MerchandiseService, 
                private productService: ProductService,
              private mapService:MapService,
            private jwtService: JwtService) {}
  
    ngOnInit() {
      const productId = this.route.snapshot.paramMap.get('productId');
      this.productId = productId ? Number(productId) : -1;

      this.role = this.jwtService.getRoleFromToken();

      const eventId = this.route.snapshot.paramMap.get('eventId');
      this.eventId = eventId ? Number(eventId) : -1;
  
      if(this.productId != -1) {
        this.merchandiseService.getMerchandiseDetails(this.productId).subscribe({
          next: (response) => {
            this.product = response;
            this.images = this.product.merchandisePhotos;
            this.paginatedReviews = this.product.reviews.slice(0,5);
            this.mapService.updateMerchandiseAddresses(response);
          },
          error: (err) => {
            console.error(err);
          }
        });
      }
    }

    buyProduct() {
      if(this.eventId != -1) {
        this.productService.buyProduct(this.productId, this.eventId).subscribe({
          next: (response) => {
            console.log('success');
          },
          error: (err) => {
            console.error(err);
          }
        });
      } else {
        this.displayEventSearch = true;
      }
    }
    
    productBought(productBought: string) {
      this.displayEventSearch = false;
      this.popupMessage = productBought;
      this.displayPopupMessage = true;
    }

    addToFavorite() {
      //logic for adding service to favorite
      this.isStarFilled = !this.isStarFilled;
    }
  
    calculatePrice(): number {
      const discountedPrice = this.product!.price - (this.product!.price * this.product!.discount)/100;
      return Math.round(discountedPrice);
    }
  
    onPageChange(event: any) {
      const startIndex = event.first;
      const endIndex = startIndex + event.rows;
      this.paginatedReviews = this.product!.reviews.slice(startIndex, endIndex);
    }

    seeChat() {
      this.router.navigate(['home','messenger', this.product?.serviceProviderId]);
    }
}
