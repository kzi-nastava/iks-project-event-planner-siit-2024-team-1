import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { JwtService } from '../auth/jwt.service';
import { UserService } from '../user/user.service';
import { tap } from 'rxjs';
import { PhotoService } from '../photos/photo.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [AvatarModule, ButtonModule, RouterModule, CommonModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
})
export class SideMenuComponent {
  username!: string;
  email!: string;
  photo!: string;
  role: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private jwtService: JwtService,
    private userService: UserService,
    private photoService: PhotoService
  ) {}

  ngOnInit() {
    if(isPlatformBrowser(this.platformId)){
        if(this.jwtService.IsLoggedIn()){
            this.role = this.jwtService.getRoleFromToken()
            if (this.jwtService.getRoleFromToken() == 'AU') {
                this.userService
                  .getAuById(this.jwtService.getIdFromToken())
                  .pipe(
                    tap((response) => {
                      this.username = response.email
                      this.email = response.email;
                      this.photo = 'guest.jpg'
                    })
                  )
                  .subscribe();
              } else if (this.jwtService.getRoleFromToken() == 'EO') {
                this.userService
                  .getEoById(this.jwtService.getIdFromToken())
                  .pipe(
                    tap((response) => {
                      this.username = response.name + ' ' + response.surname;
                      this.email = response.email;
                      this.photo = this.photoService.getPhotoUrl(response.photo);
                    })
                  )
                  .subscribe();
              } else if (this.jwtService.getRoleFromToken() == 'SP') {
                this.userService
                  .getSpById(this.jwtService.getIdFromToken())
                  .pipe(
                    tap((response) => {
                      this.username = response.name + ' ' + response.surname;
                      this.email = response.email;
                      this.photo = this.photoService.getPhotoUrl(response.photo);
                    })
                  )
                  .subscribe();
              } else if (this.jwtService.getRoleFromToken() == 'A') {
                this.userService
                  .getAdminById(this.jwtService.getIdFromToken())
                  .pipe(
                    tap((response) => {
                      this.username = response.name + ' ' + response.surname;
                      this.email = response.email;
                      this.photo = this.photoService.getPhotoUrl(response.photo);
                    })
                  )
                  .subscribe();
              }
        }
        else{
            this.username = 'Guest'
            this.email = ' '
            this.photo = 'guest.jpg'
        }
    }
  }
}
