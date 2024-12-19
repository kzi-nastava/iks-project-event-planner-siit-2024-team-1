import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { JwtService } from '../auth/jwt.service';
import { tap } from 'rxjs';
import { RegisterEoDto } from '../auth/register-dtos/RegisterEo.dto';
import { Role } from '../auth/register-dtos/role.dto';
import { copyFileSync } from 'fs';
import { MapComponent } from '../map/map.component';
import { AddressDTO } from '../auth/register-dtos/address.dto';

@Component({
  selector: 'app-register-eo-form',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule, FileUploadModule,MapComponent, ToastModule, CommonModule],
  templateUrl: './register-eo-form.component.html',
  styleUrl: './register-eo-form.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class RegisterEoFormComponent {
  selectedPhoto: string | undefined

  registerForm = new FormGroup({
    name: new FormControl(''),
    surname: new FormControl(''),
    city: new FormControl(''),
    street: new FormControl(''),
    number: new FormControl<string | null>(""),
    latitude: new FormControl<number | null>(1),
    longitude: new FormControl<number | null>(1),
    phone: new FormControl(''),
    email: new FormControl(''),
    password1: new FormControl(''),
    password2: new FormControl(''),
  })
  onAddressSelected(address: AddressDTO) {
    this.registerForm.patchValue({
      city: address.city,
      street: address.street,
      number: address.number,
      latitude:address.latitude,
      longitude:address.longitude
    });
  }
  
  constructor(private router: Router, private jwtService: JwtService){}

  createAccount(): void{
    if(this.registerForm.controls.password1.value != this.registerForm.controls.password2.value){
      //nisu iste sifre
      return;
    }
    const dto: RegisterEoDto = {
      name: this.registerForm.controls.name.value,
      surname: this.registerForm.controls.surname.value,
      phoneNumber: this.registerForm.controls.phone.value,
      email: this.registerForm.controls.email.value,
      password: this.registerForm.controls.password1.value,
      photo: this.selectedPhoto,
      role: 'EO',
      address: {
        city: this.registerForm.controls.city.value,
        street: this.registerForm.controls.street.value,
        number: this.registerForm.controls.number.value,
        latitude: this.registerForm.controls.latitude.value,
        longitude: this.registerForm.controls.longitude.value,
      }
    }
    this.jwtService.registerEo(dto).pipe(
      tap(response => {
          
      })
    ).subscribe()
  }

  uploadFile($event: any) {
    this.selectedPhoto = $event.target.files[0].name
  }
}
