import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { ProductFilters } from './product-filters';
import { PageResponse } from '../page/page-response';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../globals';
import { MerchandiseOverviewDTO } from '../merchandise/merchandise-overview-dto';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
    constructor(private http: HttpClient){}
    search(filters: ProductFilters | null = null, search: string = ''): Observable<MerchandiseOverviewDTO[]> {
        if(!filters?.isActive) return of([]);
        const params = {
            priceMin: filters?.priceMin || '',
            priceMax: filters?.priceMax || '',
            category: filters?.category || '',
            durationMin: filters?.durationMin || '',
            durationMax: filters?.durationMax || '',
            city: filters?.city || '',
            search: search || ''
        };
    
        // Send the GET request to your product search API with the constructed params
        return this.http.get<PageResponse>(`${API_URL}/api/v1/products/search`, { params }).pipe(
            map((page: PageResponse) => page.content as MerchandiseOverviewDTO[]) 
        );
    }
    

}
