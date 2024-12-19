import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { JwtService } from '../auth/jwt.service';
import { tap } from 'rxjs';
import { UpdateEoDto } from '../auth/update-dtos/register-dtos/UpdateEo.dto';
import { MapComponent } from '../map/map.component';
import { AddressDTO } from '../auth/register-dtos/address.dto';

@Component({
  selector: 'app-edit-eo-form',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule, FileUploadModule, ToastModule, CommonModule,MapComponent],
  templateUrl: './edit-eo-form.component.html',
  styleUrl: './edit-eo-form.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EditEoFormComponent {
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
    email: new FormControl({value: '', disabled: true}),
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

  editAccount(): void{
    const dto: UpdateEoDto = {
      name: this.registerForm.controls.name.value,
      surname: this.registerForm.controls.surname.value,
      phoneNumber: this.registerForm.controls.phone.value,
      photo: this.selectedPhoto,
      address: {
        city: this.registerForm.controls.city.value,
        street: this.registerForm.controls.street.value,
        number: this.registerForm.controls.number.value,
        latitude: this.registerForm.controls.latitude.value,
        longitude: this.registerForm.controls.longitude.value,
      }
    }
    this.jwtService.updateEo(1, dto).pipe(
      tap(response => {
          
      })
    ).subscribe()
  }

  uploadFile($event: any) {
    console.log($event.target.files[0]); // outputs the first file
  }

  changePassword(): void{
    this.router.navigate(['change-password']);
  }
}
