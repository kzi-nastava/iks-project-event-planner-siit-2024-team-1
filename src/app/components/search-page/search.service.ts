import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { FilterFormValues } from './filter/form-values';
import { EventFilters } from '../event/event-filters';
import { EventService } from '../event/event.service';
import { ProductFilters } from '../product/product-filters';
import { ServiceFilters } from '../service/service-filters';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchSubject = new BehaviorSubject<string>('');
  search$ = this.searchSubject.asObservable();
  private eventFiltersSubject = new BehaviorSubject<EventFilters>({
    isActive:true,
    startDate: null,
    endDate: null,
    type: null,
    city: null
  });
  eventFilters$=this.eventFiltersSubject.asObservable();
  private productFiltersSubject = new BehaviorSubject<ProductFilters>({
    isActive:true,
    priceMin: null,
    priceMax: null,
    category: null,
    durationMin: null,
    durationMax: null,
    city: null
  });
  productFilters$ = this.productFiltersSubject.asObservable();
  private serviceFiltersSubject = new BehaviorSubject<ServiceFilters>({
    isActive:true,
    priceMin: null,
    priceMax: null,
    category: null,
    durationMin: null,
    durationMax: null,
    city: null
  });
  serviceFilters$ = this.serviceFiltersSubject.asObservable();

  updateSearch(value: string) {
    this.searchSubject.next(value);
    this.router.navigate(['home', 'search']);
  }

  updateFilters(values: FilterFormValues) {
    this.eventFiltersSubject.next(this.parseEventFilters(values));
    this.productFiltersSubject.next(this.parseProductFilters(values));
    this.serviceFiltersSubject.next(this.parseServiceFilters(values));
  }

  private parseProductFilters(formValues: FilterFormValues): ProductFilters {
    // Reset product filters if "showProducts" is false
    if (!formValues.showProducts) {
      return {
        isActive:false,
        priceMin: null,
        priceMax: null,
        category: null,
        durationMin: null,
        durationMax: null,
        city: null
      };
    }
    return {
      isActive:true,
      priceMin: formValues.products.priceMin !== undefined && formValues.products.priceMin !== null
                  ? Number(formValues.products.priceMin)
                  : null,
      priceMax: formValues.products.priceMax !== undefined && formValues.products.priceMax !== null
                  ? Number(formValues.products.priceMax)
                  : null,
      category: formValues.products.category || null,
      durationMin: formValues.products.durationMin !== undefined && formValues.products.durationMin !== null
                      ? Number(formValues.products.durationMin)
                      : null,
      durationMax: formValues.products.durationMax !== undefined && formValues.products.durationMax !== null
                      ? Number(formValues.products.durationMax)
                      : null,
      city: formValues.products.city || null
    };
  }

  private parseServiceFilters(formValues: FilterFormValues): ServiceFilters {
    // Reset product filters if "showProducts" is false
    if (!formValues.showServices) {
      return {
        isActive:false,
        priceMin: null,
        priceMax: null,
        category: null,
        durationMin: null,
        durationMax: null,
        city: null
      };
    }
    return {
      isActive:true,
      priceMin: formValues.services.priceMin !== undefined && formValues.services.priceMin !== null
                  ? Number(formValues.services.priceMin)
                  : null,
      priceMax: formValues.services.priceMax !== undefined && formValues.services.priceMax !== null
                  ? Number(formValues.services.priceMax)
                  : null,
      category: formValues.services.category || null,
      durationMin: formValues.services.durationMin !== undefined && formValues.services.durationMin !== null
                      ? Number(formValues.services.durationMin)
                      : null,
      durationMax: formValues.services.durationMax !== undefined && formValues.services.durationMax !== null
                      ? Number(formValues.services.durationMax)
                      : null,
      city: formValues.services.city || null
    };
  }

  private parseEventFilters(formValues: FilterFormValues): EventFilters {
    if (!formValues.showEvents) {
      return {
        isActive:false,
        startDate: null,
        endDate: null,
        type: null,
        city: null
      };
    }
  
    return {
      isActive:true,
      startDate: formValues.events.eventDate[0] ? new Date(formValues.events.eventDate[0]) : null,
      endDate: formValues.events.eventDate[1] ? new Date(formValues.events.eventDate[1]) : null,
      type: formValues.events.type || null,
      city: formValues.events.city || null
    };
  }


  constructor(private router: Router) { }
}
