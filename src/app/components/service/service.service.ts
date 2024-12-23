import { Injectable } from '@angular/core';
import { Service } from './service';
import { map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ServiceFilters } from './service-filters';
import { PageResponse } from '../page/page-response';
import { GetAllByCaterogiesDTO, MerchandiseOverviewDTO } from '../merchandise/merchandise-overview-dto';
import { API_URL } from '../../../globals';
import { ReservationRequest } from './reservation-request';
import { ReservationResponse } from './reservation-response';
import { CreateRequest } from './create-request';
import { CreateServiceResponse } from './create-response';
import { UpdateRequest } from './update-request';
import { environment } from '../../../environments/environment';
import { TimeslotDTO } from '../my-events/dtos/CreateEventResponse.dto';
import { JwtService } from '../auth/jwt.service';
import { CalendarTimeSlotDTO } from './calendar-timeslot.dto';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private services: Service[] = [];
  getAll(): Observable<MerchandiseOverviewDTO[]> {
    return this.http
      .get<MerchandiseOverviewDTO[]>(`${environment.apiUrl}services`)
  }
  getAllByCategories(dto: GetAllByCaterogiesDTO): Observable<MerchandiseOverviewDTO[]> {
    return this.http
      .post<MerchandiseOverviewDTO[]>(`${environment.apiUrl}services/get-by-categories`, dto)
  }
  getById(id: number): Observable<Service | undefined> {
    const event = this.services.find(e => e.id === id);
    return of(event);
  }
  constructor(private http: HttpClient,private jwtService:JwtService) { }
  search(filters: ServiceFilters | null = null, search: string = '',sort:string='price'): Observable<MerchandiseOverviewDTO[]> {
    if(!filters?.isActive) return of([]);
    const params = {
      userId:this.jwtService.getIdFromToken(),
      priceMin: filters?.priceMin || '',
      priceMax: filters?.priceMax || '',
      category: filters?.category || '',
      durationMin: filters?.durationMin || '',
      durationMax: filters?.durationMax || '',
      city: filters?.city || '',
      search: search || '',
      sort:sort
    };

    // Send the GET request to your product search API with the constructed params
    return this.http.get<PageResponse>(`${API_URL}/api/v1/services/search`, { params }).pipe(
      map((page: PageResponse) => page.content as MerchandiseOverviewDTO[])
    );
  }

  reserve(serviceId: number, reservationRequest: ReservationRequest): Observable<any> {
    return this.http.post(`${API_URL}/api/v1/services/${serviceId}/reserve`, reservationRequest);
  }

  getServiceTimeslots(serviceId: number): Observable<TimeslotDTO[]> {
    return this.http.get<TimeslotDTO[]>(`${API_URL}/api/v1/services/${serviceId}/timeslots`);
  }
  
  create(createRequest: CreateRequest): Observable<CreateServiceResponse> {
    return this.http.post<CreateServiceResponse>(`${API_URL}/api/v1/services/create`, createRequest);
  }

  getAllBySpId(serviceProviderId: number): Observable<CreateServiceResponse[]> {
    return this.http.get<CreateServiceResponse[]>(`${API_URL}/api/v1/services/sp/${serviceProviderId}`);
  }
  getCalendarTimeslots(serviceProviderId: number): Observable<CalendarTimeSlotDTO[]> {
    return this.http.get<CalendarTimeSlotDTO[]>(`${environment.apiUrl}services/timeslots/${serviceProviderId}`);
  }

  update(serviceId: number, updateRequest: UpdateRequest): Observable<CreateServiceResponse> {
    return this.http.put<CreateServiceResponse>(`${API_URL}/api/v1/services/update/${serviceId}`, updateRequest);
  }

  delete(serviceId: number) {
    return this.http.put(`${API_URL}/api/v1/services/delete/${serviceId}`,null);
  }
}
