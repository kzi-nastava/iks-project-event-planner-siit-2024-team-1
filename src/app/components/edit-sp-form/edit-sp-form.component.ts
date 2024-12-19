import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { JwtService } from '../auth/jwt.service';
import { UpdateSpDto } from '../auth/update-dtos/register-dtos/UpdateSp.dto';
import { tap } from 'rxjs';
import { CreateMerchandisePhotoDTO, PhotoToAdd } from '../merchandise/merchandise-photos-request-dto';
import { PhotoService } from '../photos/photo.service';
import { UserService } from '../user/user.service';
import { response } from 'express';
import { MapComponent } from '../map/map.component';
import { AddressDTO } from '../auth/register-dtos/address.dto';

@Component({
  selector: 'app-edit-sp-form',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule,MapComponent, FileUploadModule, ToastModule, CommonModule],
  templateUrl: './edit-sp-form.component.html',
  styleUrl: './edit-sp-form.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EditSpFormComponent {
  selectedPhoto: string | undefined;
  selectedPhotos: string[] | undefined;

  photosToShow: string[] = [];

  photosToAdd: PhotoToAdd[] = [];

  spId!: number;
  fbl: FormBuilder = new FormBuilder();
  


  registerForm = new FormGroup({
    company: new FormControl({value: '', disabled: true}),
    description: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    street: new FormControl('', [Validators.required]),
    number: new FormControl<string | null>(""),
    latitude: new FormControl<number | null>(1),
    longitude: new FormControl<number | null>(1),
    phone: new FormControl('', [Validators.required]),
    email: new FormControl({value: '', disabled: true}),
    photos: this.fbl.array([])
  })
  constructor(private route: ActivatedRoute, private router: Router, private jwtService: JwtService, private userService: UserService, private photoService: PhotoService){}

  ngOnInit(){
    this.loadData();
  }
  onAddressSelected(address: AddressDTO) {
    this.registerForm.patchValue({
      city: address.city,
      street: address.street,
      number: address.number,
      latitude:address.latitude,
      longitude:address.longitude
    });
  }
  loadData(): void{
    const id = this.route.snapshot.paramMap.get('id');
    this.spId = id ? Number(id) : -1;

    // Assuming you have a service method that fetches the response
  this.userService.getSpById(1).pipe(tap(response => {
    this.registerForm.patchValue({
      company: response.company,
      description: response.description,
      name: response.name,
      surname: response.surname,
      city: response.address?.city, // Nested properties like address
      street: response.address?.street,
      number: response.address?.number,
      latitude: response.address?.latitude,
      longitude: response.address?.longitude,
      phone: "adf",
      email: response.email,
    });

    // If 'photos' is an array in the response and should update a FormArray
    const photosArray = this.registerForm.get('photos') as FormArray;
    response.photos.forEach((photo: string) => {
      photosArray.push(new FormControl(photo));
    });
  })).subscribe()
  }

  editAccount(): void{
    const dto: UpdateSpDto = {
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
      },
      description: this.registerForm.controls.description.value,
      photos: this.photosToAdd.map(x => x.id)
    }
    this.jwtService.updateSp(2, dto).pipe(
      tap(response => {
          
      })
    ).subscribe()
  }

  changePassword(): void{
    this.router.navigate(['change-password']);
  }

  uploadFile($event: any): void {
    const files = $event.target.files as File[];
    if (files && files.length > 0) {
        const file = files[0]; 

        const photosArray = this.registerForm.get('photos') as FormArray;

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
    const photosArray = this.registerForm.get('photos') as FormArray;
    photosArray.push(this.fbl.group({
      photo: new FormControl(photoName)
    }));
    this.updatePhotosToShow();
  }

  updatePhotosToShow(): void {
    const photosArray = this.registerForm.get('photos') as FormArray;
    this.photosToShow = photosArray.value.map((photo: { photo: string }) => photo.photo);
  }

  removePhoto(index: number): void {
    const photosArray = this.registerForm.get('photos') as FormArray;
  
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
      this.photoService.deleteBusinessPhoto(photoId, this.spId, true).pipe(
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
    const photosArray = this.registerForm.get('photos') as FormArray;
    return photosArray.value as CreateMerchandisePhotoDTO[];
  }

}
