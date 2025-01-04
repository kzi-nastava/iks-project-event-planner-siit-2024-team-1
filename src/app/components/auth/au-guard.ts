import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { JwtService } from "./jwt.service";

@Injectable({
    providedIn: 'root'
  })
  export class AuGuard implements CanActivate {
  
    constructor(private jwtService: JwtService, private router: Router) { }
  
    canActivate(): boolean {
      if (this.jwtService.IsAu()) {
        return true;
      } else {
        return false;
      }
    }
  
  }
  