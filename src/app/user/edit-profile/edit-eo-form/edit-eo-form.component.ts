import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { JwtService } from '../../../infrastructure/auth/jwt.service';
import { tap } from 'rxjs';
import { UpdateEoDto } from '../../../infrastructure/auth/model/update-dtos/UpdateEo.dto';
import { MapComponent } from '../../../shared/map/map.component';
import { AddressDTO } from '../../../infrastructure/auth/model/register-dtos/address.dto';
import { PhotoService } from '../../../shared/photos/photo.service';
import { UserService } from '../../user.service';
import { response } from 'express';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-edit-eo-form',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule, FileUploadModule, ToastModule, CommonModule,MapComponent, ConfirmDialogModule],
  templateUrl: './edit-eo-form.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './edit-eo-form.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService]
})
export class EditEoFormComponent {
  selectedPhoto: string | undefined
  selectedProfilePhoto: string | null = null;
  eoId!: number

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

    ngOnInit(){
      this.loadData()
    }
    deactivateAccount(){
      this.confirmationService.confirm({
        message: 'Are you sure you want to deactivate account?',
        header: 'Confirm Denial',
        icon: 'pi pi-times-circle',
        accept: () => {
          this.jwtService.deactivate(this.jwtService.getIdFromToken()).pipe(
            tap(response => {
              if(!response){
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You can not deactivate account because you have created events or booked reservations' });
              }
              else{
                this.router.navigate([''])
              }
            })
          ).subscribe()
        }
      });
    }

    loadData(): void{
      const id = this.route.snapshot.paramMap.get('id');
      this.eoId = id ? Number(id) : -1;

      // Assuming you have a service method that fetches the response
    this.userService.getEoById(this.eoId).pipe(tap(response => {
      this.registerForm.patchValue({
        name: response.name,
        surname: response.surname,
        city: response.address?.city, // Nested properties like address
        street: response.address?.street,
        number: response.address?.number,
        latitude: response.address?.latitude,
        longitude: response.address?.longitude,
        phone: response.phoneNumber,
        email: response.email,
      });

      this.selectedProfilePhoto = response.photo
    })).subscribe()
    }

  constructor(private router: Router, private jwtService: JwtService, private photoService: PhotoService, private userService: UserService, private route: ActivatedRoute,
    private confirmationService: ConfirmationService, private messageService: MessageService
  ){}
  getPhotoUrl(photo: string): string{
    return this.photoService.getPhotoUrl(photo);
  }
  editAccount(): void{
    const dto: UpdateEoDto = {
      name: this.registerForm.controls.name.value,
      surname: this.registerForm.controls.surname.value,
      phoneNumber: this.registerForm.controls.phone.value,
      photo: this.selectedProfilePhoto,
      address: {
        city: this.registerForm.controls.city.value,
        street: this.registerForm.controls.street.value,
        number: this.registerForm.controls.number.value,
        latitude: this.registerForm.controls.latitude.value,
        longitude: this.registerForm.controls.longitude.value,
      }
    }
    this.jwtService.updateEo(this.eoId, dto).pipe(
      tap(response => {
          this.router.navigate(['home'])
      })
    ).subscribe()
  }

  uploadFile($event: any) {
    console.log($event.target.files[0]); // outputs the first file
  }
  uploadProfilePhoto(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.photoService.uploadUserPhoto(file, this.eoId).pipe(
        tap(response => {
          this.selectedProfilePhoto = file.name; // Assuming the server returns the file name
        })
      ).subscribe();
    }
  }

  removeProfilePhoto(): void {
    if (this.selectedProfilePhoto) {
      this.photoService.deleteUserPhoto(this.eoId).pipe(
        tap(() => {
          this.selectedProfilePhoto = null;
        })
      ).subscribe();
    }
  }
  changePassword(): void{
    this.router.navigate(['change-password', this.eoId]);
  }
}
