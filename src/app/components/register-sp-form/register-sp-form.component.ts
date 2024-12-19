import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule, FormArray, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { RegisterSpDto } from '../auth/register-dtos/RegisterSp.dto';
import { tap } from 'rxjs';
import { JwtService } from '../auth/jwt.service';
import { PhotoService } from '../photos/photo.service';
import { CreateBusinessPhotoDTO, CreateMerchandisePhotoDTO, PhotoToAdd } from '../merchandise/merchandise-photos-request-dto';
import { MapComponent } from '../map/map.component';
import { AddressDTO } from '../auth/register-dtos/address.dto';
@Component({
  selector: 'app-register-sp-form',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule, FileUploadModule,MapComponent, ToastModule, CommonModule],
  templateUrl: './register-sp-form.component.html',
  styleUrl: './register-sp-form.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class RegisterSpFormComponent {
  selectedPhoto: string | undefined;
  selectedPhotos: string[] | undefined;

  photosToShow: string[] = [];

  photosToAdd: PhotoToAdd[] = [];
  fbl: FormBuilder = new FormBuilder();


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
    company: new FormControl(''),
    description: new FormControl(''),
    companyPhotos: this.fbl.array([])
  })
  
  constructor(private router: Router, private jwtService: JwtService, private photoService: PhotoService){}

  onAddressSelected(address: AddressDTO) {
    this.registerForm.patchValue({
      city: address.city,
      street: address.street,
      number: address.number,
      latitude:address.latitude,
      longitude:address.longitude
    });
  }


  createAccount(): void{
    if(this.registerForm.controls.password1.value != this.registerForm.controls.password2.value){
      //nisu iste sifre
      return;
    }
    const dto: RegisterSpDto = {
      name: this.registerForm.controls.name.value,
      surname: this.registerForm.controls.surname.value,
      phoneNumber: this.registerForm.controls.phone.value,
      email: this.registerForm.controls.email.value,
      password: this.registerForm.controls.password1.value,
      photo: this.selectedPhoto,
      role: 'SP',
      address: {
        city: this.registerForm.controls.city.value,
        street: this.registerForm.controls.street.value,
        number: this.registerForm.controls.number.value,
        latitude: this.registerForm.controls.latitude.value,
        longitude: this.registerForm.controls.longitude.value,
      },
      company: this.registerForm.controls.company.value,
      description: this.registerForm.controls.description.value,
      photos: this.photosToAdd.map(x => x.id)
    }
    this.jwtService.registerSp(dto).pipe(
      tap(response => {
          
      })
    ).subscribe()
  }

  uploadFile($event: any): void {
    const files = $event.target.files as File[];
    if (files && files.length > 0) {
        const file = files[0]; 

        const photosArray = this.registerForm.get('companyPhotos') as FormArray;

        // Check if the file name already exists in the array
        const existingPhoto = photosArray.value.find((photo: { photo: string }) => photo.photo === file.name);
        
        if (!existingPhoto) {
            this.addPhoto(file.name); 
            this.photoService.uploadBusinessPhoto(file).pipe(tap(response => {
                this.photosToAdd.push({
                  id: response,
                  photo: file.name
                })
            })).subscribe();
        } else {
            console.log('File already exists, skipping upload.');
        }
    }
}

  getPhotoUrl(photo: string): string{
    return this.photoService.getPhotoUrl(photo);
  }

  addPhoto(photoName: string): void {
    const photosArray = this.registerForm.get('companyPhotos') as FormArray;
    photosArray.push(this.fbl.group({
      photo: new FormControl(photoName)
    }));
    this.updatePhotosToShow();
  }

  updatePhotosToShow(): void {
    const photosArray = this.registerForm.get('companyPhotos') as FormArray;
    this.photosToShow = photosArray.value.map((photo: { photo: string }) => photo.photo);
  }

  removePhoto(index: number): void {
    const photosArray = this.registerForm.get('companyPhotos') as FormArray;
  
    // Get the photo name from the form array
    const photoUrl = photosArray.at(index).value.photo;
    const photoName = photoUrl.split('/').pop() // extract just the filename without the extension
  
    // Find the ID of the photo
    const photoId = this.photosToAdd.find(photo => {
      const storedPhotoName = photo.photo.split('/').pop()
      console.log(storedPhotoName)
      return storedPhotoName === photoName;
    })?.id;
  
    if (photoId) {
      this.photoService.deleteBusinessPhoto(photoId, -1, false).pipe(
        tap(response => {
          // Success handling here
        })
      ).subscribe();
  
      // Remove the corresponding photo from photosToAdd
      const photoIndex = this.photosToAdd.findIndex(photo => {
        const storedPhotoName = photo.photo.split('/').pop()
        return storedPhotoName === photoName;
      });
      if (photoIndex !== -1) {
        this.photosToAdd.splice(photoIndex, 1);
      }
      console.log(this.photosToAdd)
      // Remove the photo from the FormArray
      photosArray.removeAt(index);
  
      // Update the list of photos to show
      this.updatePhotosToShow();
    } else {
      console.log('Photo not found in photosToAdd array');
    }
  }
  
  


  getPhotos(): CreateMerchandisePhotoDTO[] {
    const photosArray = this.registerForm.get('companyPhotos') as FormArray;
    return photosArray.value as CreateMerchandisePhotoDTO[];
  }
}
