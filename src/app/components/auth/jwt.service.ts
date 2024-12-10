import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor(private httpClient: HttpClient, private router: Router) {}
  setTokens(tokens: TokensDto): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
    }
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

  registerAu(dto: RegisterAuDto): Observable<RegisterAuResponseDto> {
    return this.httpClient.post<RegisterAuResponseDto>(`${environment.apiUrl}auth/register-au`, dto);
  }
  registerEo(dto: RegisterEoDto): Observable<RegisterEoResponseDto> {
    return this.httpClient.post<RegisterEoResponseDto>(`${environment.apiUrl}auth/register-eo`, dto);
  }
  registerSp(dto: RegisterSpDto): Observable<RegisterSpResponseDto> {
    return this.httpClient.post<RegisterSpResponseDto>(`${environment.apiUrl}auth/register-sp`, dto);
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

  changePassword(id: number, dto: ChangePasswordDto): Observable<ChangePasswordResponseDto> {
    return this.httpClient.put<ChangePasswordResponseDto>(`${environment.apiUrl}users/change-password/${id}`, dto);
  }

  IsLoggedIn(): boolean {
    let token = localStorage.getItem('access_token');
    if (token != null) return this.isTokenValid(token);
    return false;
  }

  IsAdmin(): boolean {
    return this.getRoleFromToken() == 'Admin';
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

  refreshAccessToken(): Observable<any> {
    const refreshToken = this.isLocalStorageAvailable() ? localStorage.getItem('refresh_token') || '' : '';
    const accessToken = this.isLocalStorageAvailable() ? localStorage.getItem('access_token') || '' : '';
  
    const url = `${environment.apiUrl}/auth/refreshToken`;
  
    const token: TokensDto = {
      accessToken,
      refreshToken,
    };
    return this.httpClient.post<TokensDto>(url, token).pipe(
      tap((response) => {
        if (this.isLocalStorageAvailable()) {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
        }
      }),
      catchError((error) => {
        this.router.navigate(['/auth/login']);
        console.error('Error refreshing access token:', error);
        return throwError(error);
      })
    );
  }

  private isLocalStorageAvailable(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
