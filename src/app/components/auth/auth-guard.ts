import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private jwtService: JwtService, private router: Router) { }

  canActivate(): boolean {
    if (this.jwtService.IsLogged()) {
      return true;
    } else {
      this.router.navigate(['']);
      return false;
    }
  }
}

