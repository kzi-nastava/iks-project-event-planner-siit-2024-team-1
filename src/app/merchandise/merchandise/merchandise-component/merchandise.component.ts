import { Component, Input, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { CommonModule } from '@angular/common';
import { MerchandiseCardComponent } from '../merchandise-card/merchandise-card.component';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';
import { EventType } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { SidebarModule } from 'primeng/sidebar';
import { Merchandise } from '../model/merchandise';
import { MerchandiseService } from '../merchandise.service';
import { MerchandiseOverviewDTO } from '../model/merchandise-overview-dto';
import { ProductFilters } from '../../product/model/product-filters';
import { SearchService } from '../../../layout/search-page/search.service';
import { ProductService } from '../../product/product.service';
import { ServiceFilters } from '../../service/model/service-filters';
import { combineLatest, debounceTime, distinctUntilChanged } from 'rxjs';
import { MapService } from '../../../shared/map/map.service';

interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

@Component({
  selector: 'app-merchandise',
  standalone: true,
  imports: [CardModule,
    ButtonModule,
    PanelModule,
    CommonModule,
    MerchandiseCardComponent,
    DividerModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    DropdownModule,
    FloatLabelModule,
    TableModule,
    SidebarModule,
    PaginatorModule],
  templateUrl: './merchandise.component.html',
  styleUrl: './merchandise.component.scss'
})
export class MerchandiseComponent {
  public merchandise: MerchandiseOverviewDTO[] = [];
  public displayedMerchandise: MerchandiseOverviewDTO[] = [];
  public filterSidebarVisible = false;
  // Pagination properties
  public first: number = 0;
  public rows: number = 3;
  public totalRecords: number = 0;
  searchValue: string = '';
  productFilterValues: ProductFilters | null = null;
  serviceFilterValues: ServiceFilters | null = null;
  merchandiseSort:string='price';
  @Input() panelTitle: string = '';
  @Input() panelType: string = '';
  eventId: number = -1;
  constructor(private merchandiseService: MerchandiseService, private searchService: SearchService,private mapService:MapService) { }

  async ngOnInit() {
    switch (this.panelType) {
      case 'Top':
      case 'top':
        {
          this.merchandiseService.getTop().subscribe({
            next: (data: MerchandiseOverviewDTO[]) => {
              this.merchandise = data;
              this.totalRecords = this.merchandise.length;
              this.mapService.updateMerchandiseAddresses(data);
              this.updateDisplayedEvents();
            }
          });
          break;
        }
      case "Search":
      case "search": {
        combineLatest([
          this.searchService.search$,
          this.searchService.productFilters$,
          this.searchService.serviceFilters$,
          this.searchService.merchandiseSort$
        ]).pipe(

          distinctUntilChanged(),

          debounceTime(300)
        ).subscribe({
          next: ([searchValue, productFilters, serviceFilters,merchandiseSort]) => {
            this.searchValue = searchValue;
            this.productFilterValues = productFilters;
            this.serviceFilterValues = serviceFilters;
            this.merchandiseSort=merchandiseSort;

            // Single search trigger
            this.merchandiseService.search(
              this.serviceFilterValues,
              this.productFilterValues,
              this.searchValue,
              this.merchandiseSort
            ).subscribe({
              next: (data: MerchandiseOverviewDTO[]) => {
                this.merchandise = data;
                this.totalRecords = this.merchandise.length;
                this.mapService.updateMerchandiseAddresses(data);
                this.updateDisplayedEvents();
              }
            });
          }
        });
        break;
      }
      case 'Favorite':
      case 'favorite':
        {
          if (typeof window !== 'undefined' && window.localStorage) {
          this.merchandiseService.getFavorites().subscribe({
            next: (data: MerchandiseOverviewDTO[]) => {
              this.merchandise = data;
              this.totalRecords = this.merchandise.length;
              this.mapService.updateMerchandiseAddresses(data);
              this.updateDisplayedEvents();
            }
          });
        }
          break;
        }
    }
  }



  updateDisplayedEvents() {
    const end = this.first + this.rows;
    this.displayedMerchandise = this.merchandise.slice(this.first, end);
  }
  onPageChange(event: PageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.updateDisplayedEvents();
  }

  getMerchandiseByCategory(categoryId: number, maxAmount: number) {
    if(categoryId > 0) {
      this.merchandiseService.getMerchandiseByCategory(categoryId, maxAmount).subscribe({
        next: (data: MerchandiseOverviewDTO[]) => {
          this.merchandise = data;
          this.totalRecords = this.merchandise.length;
          this.updateDisplayedEvents();
        }
      });
    }else {
      console.warn("Category Id is invalid: ", categoryId);
    }

  }
}
