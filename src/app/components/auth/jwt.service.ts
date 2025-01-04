import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokensDto } from './tokens.dto';
import { LoginDTO } from '../login-form/login.dto';
import { RegisterAuDto } from './register-dtos/RegisterAu.dto';
import { RegisterEoDto } from './register-dtos/RegisterEo.dto';
import { RegisterSpDto } from './register-dtos/RegisterSp.dto';
import { RegisterEoResponseDto } from './register-dtos/RegisterEoResponse.dto';
import { RegisterAuResponseDto } from './register-dtos/RegisterAuResponse.dto';
import { RegisterSpResponseDto } from './register-dtos/RegisterSpResponse.dto';
import { UpdateAuDto } from './update-dtos/register-dtos/UpdateAu.dto';
import { UpdateAuResponseDto } from './update-dtos/register-dtos/UpdateAuResponse.dto';
import { UpdateEoDto } from './update-dtos/register-dtos/UpdateEo.dto';
import { UpdateEoResponseDto } from './update-dtos/register-dtos/UpdateEoResponse.dto';
import { UpdateSpDto } from './update-dtos/register-dtos/UpdateSp.dto';
import { UpdateSpResponseDto } from './update-dtos/register-dtos/UpdateSpResponse.dto';
import { ChangePasswordDto } from './update-dtos/register-dtos/ChangePassword.dto';
import { ChangePasswordResponseDto } from './update-dtos/register-dtos/ChangePasswordResponse.dto';
import { EventToken } from './event-token';
import { NotificationService } from '../sidebar-notifications/notification.service';
import { env } from 'process';
import { RefreshTokenDto } from './refresh-token.dto';
import { Token } from 'html2canvas/dist/types/css/syntax/tokenizer';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor(private httpClient: HttpClient, private router: Router) { }

  setEventToken(token: EventToken): void {
    localStorage.setItem("event_token", token.eventToken);
  }

  removeEventToken(): void {
    localStorage.removeItem('event_token');
  }

  IsLogged(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return true;
  }

  getToken(): string | null {
    if (this.isLocalStorageAvailable()) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  getEventToken(): string | null {
    return localStorage.getItem('event_token');
  }

  isInviteTokenValid(): boolean {
    if (this.getToken() === null || this.getEventToken() === null) return false;
    return this.decodeToken(this.getToken() ?? "").sub == this.decodeToken(this.getEventToken() ?? "").userEmail;
  }

  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }

  isTokenValid(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) {
      return false;
    }
    return true;
  }

  login(dto: LoginDTO): Observable<TokensDto> {
    return this.httpClient.post<TokensDto>(
      `${environment.apiUrl}auth/login`,
      dto
    );
  }

  fastRegister(email: string): Observable<TokensDto> {
    const params = new HttpParams().set('email', email);

    return this.httpClient.post<TokensDto>(
      `${environment.apiUrl}auth/fast-register`,
      null, // no request body
      { params: params }
    );
  }

  registerAu(dto: RegisterAuDto, promotion?: boolean): Observable<RegisterAuResponseDto> {
    let url = `${environment.apiUrl}auth/register-au`;
    
    // Conditionally append promotion query parameter
    if (promotion) {
      url = `${url}?promotion=${encodeURIComponent(promotion)}`;
    }
  
    return this.httpClient.post<RegisterAuResponseDto>(url, dto);
  }
  
  registerEo(dto: RegisterEoDto, promotion?: boolean): Observable<RegisterEoResponseDto> {
    let url = `${environment.apiUrl}auth/register-eo`;
    
    // Conditionally append promotion query parameter
    if (promotion) {
      url = `${url}?promotion=${encodeURIComponent(promotion)}`;
    }
  
    return this.httpClient.post<RegisterEoResponseDto>(url, dto);
  }
  
  registerSp(dto: RegisterSpDto, promotion?: boolean): Observable<RegisterSpResponseDto> {
    let url = `${environment.apiUrl}auth/register-sp`;
    
    // Conditionally append promotion query parameter
    if (promotion) {
      url = `${url}?promotion=${encodeURIComponent(promotion)}`;
    }
  
    return this.httpClient.post<RegisterSpResponseDto>(url, dto);
  }

  updateAu(id: number, dto: UpdateAuDto): Observable<UpdateAuResponseDto> {
    return this.httpClient.put<UpdateAuResponseDto>(`${environment.apiUrl}users/update-au/${id}`, dto);
  }
  updateEo(id: number, dto: UpdateEoDto): Observable<UpdateEoResponseDto> {
    return this.httpClient.put<UpdateEoResponseDto>(`${environment.apiUrl}users/update-eo/${id}`, dto);
  }
  updateSp(id: number, dto: UpdateSpDto): Observable<UpdateSpResponseDto> {
    return this.httpClient.put<UpdateSpResponseDto>(`${environment.apiUrl}users/update-sp/${id}`, dto);
  }

  deactivate(id: number): Observable<boolean> {
    return this.httpClient.put<boolean>(`${environment.apiUrl}auth/deactivate/${id}`, {});
  }

  changePassword(id: number, dto: ChangePasswordDto): Observable<ChangePasswordResponseDto> {
    return this.httpClient.put<ChangePasswordResponseDto>(`${environment.apiUrl}users/change-password/${id}`, dto);
  }

  IsLoggedIn(): boolean {
    let token = localStorage.getItem('access_token');
    if (token != null) return this.isTokenValid(token);
    return false;
  }

  IsAdmin(): boolean {
    return this.getRoleFromToken() == 'A';
  }

  IsAu(): boolean {
    return this.getRoleFromToken() == 'AU';
  }

  IsSp(): boolean {
    return this.getRoleFromToken() == 'SP';
  }

  IsEo(): boolean {
    return this.getRoleFromToken() == 'EO';
  }

  getRoleFromToken(): string {
    let token = localStorage.getItem('access_token');
    if (token != null) {
      const tokenInfo = this.decodeToken(token);
      const role = tokenInfo.role;
      return role;
    }
    return '';
  }

  getIdFromToken(): number {
    if (this.isLocalStorageAvailable()){
      let token = localStorage.getItem('access_token');
    if (token != null) {
      const tokenInfo = this.decodeToken(token);
      const id = tokenInfo.id;
      return parseInt(id, 10);
    }
    }
    return -1;
    
  }

  Logout(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
  refreshToken(refreshToken: string): Observable<TokensDto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`, // Add the refresh token to Authorization header
    });

    return this.httpClient.post<TokensDto>(`${environment.apiUrl}auth/refresh_token`,{}, {headers});
  }
  
  setTokens(response: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
  }

  private isLocalStorageAvailable(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
