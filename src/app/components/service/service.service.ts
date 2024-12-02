import { Injectable } from '@angular/core';
import { Service } from './service';
import { map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ServiceFilters } from './service-filters';
import { PageResponse } from '../page/page-response';
import { MerchandiseOverviewDTO } from '../merchandise/merchandise-overview-dto';
import { API_URL } from '../../../globals';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private services: Service[] = [];
  getAll(): Observable<Service[]> {
    return of(this.services);
  }
  getById(id: number): Observable<Service | undefined> {
    const event = this.services.find(e => e.id === id);
    return of(event);
  }
  constructor(private http: HttpClient) { }
  search(filters: ServiceFilters | null = null, search: string = ''): Observable<MerchandiseOverviewDTO[]> {
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
    return this.http.get<PageResponse>(`${API_URL}/api/v1/services/search`, { params }).pipe(
      map((page: PageResponse) => page.content as MerchandiseOverviewDTO[])
    );
  }
}
