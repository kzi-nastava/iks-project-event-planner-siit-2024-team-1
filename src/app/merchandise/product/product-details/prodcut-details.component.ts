import { Component, OnInit } from '@angular/core';
import { MerchandiseDetailDTO } from '../../merchandise/model/merchandise-detail-dto';
import { ActivatedRoute } from '@angular/router';
import { MerchandiseService } from '../../merchandise/merchandise.service';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { CurrencyPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { FieldsetModule } from 'primeng/fieldset';
import { DialogModule } from 'primeng/dialog';
import { ProductService } from '../product.service';
import { BuyProductComponent } from "./buy-product/buy-product.component";
import { Router } from '@angular/router';
import { JwtService } from '../../../infrastructure/auth/jwt.service';
import { MapComponent } from '../../../shared/map/map.component';
import { MapService } from '../../../shared/map/map.service';
import { LeaveReviewComponent } from "../../../review/leave-review/leave-review.component";
import { tap } from 'rxjs';
import { ReviewService } from '../../../review/review-service.service';
import { ReviewType } from '../../../review/leave-review/review-request-dto';
import { PhotoService } from '../../../shared/photos/photo.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-prodcut-details',
  standalone: true,
  imports: [PaginatorModule, ButtonModule, CurrencyPipe, CommonModule, GalleriaModule, FieldsetModule, MapComponent, DialogModule, BuyProductComponent, LeaveReviewComponent, ToastModule],
  templateUrl: './prodcut-details.component.html',
  styleUrl: './prodcut-details.component.scss',
  providers: [MessageService]
})
export class ProdcutDetailsComponent implements OnInit {
  productId: number = -1;
  eventId: number = -1;
  displayEventSearch = false;
  product: MerchandiseDetailDTO | null = null;
  isStarFilled: boolean = false;
  role: string = '';
  isVisible: boolean = false;
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
                private reviewService: ReviewService,
                private mapService:MapService,
                private jwtService: JwtService,
                private photoService: PhotoService,
                private messageService: MessageService) {}

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
            this.images = this.product.merchandisePhotos.map(x => this.photoService.getPhotoUrl(x.photo));
            this.paginatedReviews = this.product.reviews.slice(0,5);
            this.mapService.updateMerchandiseAddresses(response);
          },
          error: (err) => {
            console.error(err);
          }
        });

        this.reviewService.isEligibleForReview(this.jwtService.getIdFromToken(), this.productId, ReviewType.MERCHANIDSE_REVIEW).subscribe({
          next: (response) => {
            this.isVisible = response;
          },
          error: (err) => {
            this.isVisible = false;
          }
        });
      }
    }

    buyProduct() {
      if(this.eventId != -1) {
        this.productService.buyProduct(this.productId, this.eventId).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Purchased',
              detail: response.message
            });
            setTimeout(() => {
              this.router.navigate(['home','budget', this.eventId]);
            }, 2000);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error.message
            });
          }
        });
      } else {
        this.displayEventSearch = true;
      }
    }

    productBought(productBought: {success: boolean, message: string}) {
      this.displayEventSearch = false;
      if(productBought.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Purchased',
          detail: productBought.message
        });
      }else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: productBought.message
        });
      }
    }
    isFavorited: boolean = false;
    toggleFavorite(): void {
        this.isFavorited = !this.isFavorited;
        this.merchandiseService
          .favorizeMerchandise(
            this.product?.id,
             this.jwtService.getIdFromToken()
          )
          .pipe(tap((response) => {}))
          .subscribe();
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
