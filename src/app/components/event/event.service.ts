import { Injectable } from '@angular/core';
import { Event } from './event';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EventOverviewDTO } from './event-overview-dto';
import { API_URL } from '../../../globals';
import { PageResponse } from '../page/page-response';
import { EventFilters } from './event-filters';
import { JwtService } from '../auth/jwt.service';
import { InviteResponseDTO } from './invite-response';
@Injectable({
    providedIn: 'root'
})
export class EventService {
    public SortOptions: string[] = [
        'title',
        'description',
        'maxParticipants',
        'isPublic',
        'date',
        'type'];


    private events: Event[] = [];
    constructor(private http: HttpClient,private jwtService:JwtService) { }

    getAll(): Observable<EventOverviewDTO[]> {
        return this.http.get<PageResponse>(`${API_URL}/api/v1/events/all`).pipe(
            map((page: PageResponse) => page.content as EventOverviewDTO[])
        );
    }


    getById(id: number): Observable<Event | undefined> {
        const event = this.events.find(e => e.id === id);
        return of(event);
    }

    getTop(): Observable<EventOverviewDTO[]> {
        return this.http.get<PageResponse>(`${API_URL}/api/v1/events/top`).pipe(
            map((page: PageResponse) => page.content as EventOverviewDTO[])
        );
    }

    getFollowed(): Observable<EventOverviewDTO[]> {
        let userId=this.jwtService.getIdFromToken();
        const params={
            userId:userId
        };
        return this.http.get<EventOverviewDTO[]>(`${API_URL}/api/v1/events/followed`,{params});
    }


    private formatDate = (date: Date | null | undefined) => {
        if (!date) return '';
        return date.toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format
    };

    search(
        filters: EventFilters|null=null, search: string='',sort:string='date') {
            if(!filters?.isActive) return of([]);
            
            const params = {
                startDate: this.formatDate(filters?.startDate),
                endDate: this.formatDate(filters?.endDate),
                type: filters?.type || '',
                city: filters?.city || '',
                search: search,
                sort:sort
            };
            
            
            return this.http.get<PageResponse>(`${API_URL}/api/v1/events/search`, { params }).pipe(
                map((page: PageResponse) => page.content as EventOverviewDTO[])
            );

    }

    inviteToEvent(email: string, eventId: number) {
        const params = new HttpParams()
          .set('email', email)
          .set('eventId', eventId.toString());
      
        return this.http.post<InviteResponseDTO>(`${API_URL}/api/v1/events/invite`, {}, { params });
      }
}
