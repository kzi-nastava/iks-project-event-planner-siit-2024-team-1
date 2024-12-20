import { Injectable } from '@angular/core';
import { API_URL } from '../../../globals';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserOverviewDTO } from './user-overview-dto';
import { EMPTY, Observable, of } from 'rxjs';
import { RegisterSpResponseDto } from '../auth/register-dtos/RegisterSpResponse.dto';
import { environment } from '../../../environments/environment';
import { JwtService } from '../auth/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient,private jwtService:JwtService) { }
  followEvent(eventId: number) {
    const userId=this.jwtService.getIdFromToken();
    if(userId===-1)return EMPTY;
    const params = new HttpParams().set('userId', userId).set("eventId", eventId);

    return this.httpClient.post<any>(`${API_URL}/api/v1/users/follow-event`, null, { params: params });
  }
  getChatUsers(userId: number,role:string): Observable<UserOverviewDTO[]> {
    if (userId === -1) return of([]);
    if(role==='EO')
    return this.httpClient.get<UserOverviewDTO[]>(`${API_URL}/api/v1/users/eo/${userId}/chat-users`);
  else if(role==='SP')
    return this.httpClient.get<UserOverviewDTO[]>(`${API_URL}/api/v1/users/sp/${userId}/chat-users`);
  else
  return this.httpClient.get<UserOverviewDTO[]>(`${API_URL}/api/v1/users/au/${userId}/chat-users`);
  }
  blockUser(blockerId: number, blockedUserId: number): Observable<any> {
    return this.httpClient.post<any>(
      `${API_URL}/api/v1/users/${blockerId}/block/${blockedUserId}`, 
      null
    );
  }

  getSpById(id: number | undefined | null): Observable<RegisterSpResponseDto>{
    return this.httpClient.get<RegisterSpResponseDto>(`${environment.apiUrl}users/sp/${id}`);
  }

}
