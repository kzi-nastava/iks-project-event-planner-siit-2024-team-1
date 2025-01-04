import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { JwtService } from "./jwt.service";

@Injectable({
    providedIn: 'root'
  })
  export class EoGuard implements CanActivate {
  
    constructor(private jwtService: JwtService, private router: Router) { }
  
    canActivate(): boolean {
      if (this.jwtService.IsEo()) {
        return true;
      } else {
        return false;
      }
    }
  
  }
  