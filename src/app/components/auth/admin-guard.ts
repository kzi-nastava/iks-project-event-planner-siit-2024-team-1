import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { JwtService } from "./jwt.service";

@Injectable({
    providedIn: 'root'
  })
  export class AdminGuard implements CanActivate {
  
    constructor(private jwtService: JwtService, private router: Router) { }
  
    canActivate(): boolean {
      if (this.jwtService.IsAdmin()) {
        return true;
      } else {
        return false;
      }
    }
  
  }
  