import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { tap } from 'rxjs';
import { JwtService } from '../auth/jwt.service';
import { CategoryDto } from '../category/category.dto';
import { CategoryService } from '../category/category.service';
import { RecommendCategoryComponent } from '../category/recommend-category/recommend-category.component';
import { CreateEventTypeResponseDTO } from '../create-event-type-form/dtos/create-event-type-response.dto';
import { EventTypeService } from '../create-event-type-form/event-type.service';
import { CreateProductRequestDTO, UpdateProductRequestDTO } from '../create-product/dto/create-product.dto';
import { CreateMerchandisePhotoDTO, PhotoToAdd } from '../merchandise/merchandise-photos-request-dto';
import { ProductService } from '../product/product.service';
import { MerchandiseService } from '../merchandise/merchandise.service';
import { response } from 'express';
import { PhotoService } from '../photos/photo.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MapComponent } from '../map/map.component';
import { AddressDTO } from '../auth/register-dtos/address.dto';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    MultiSelectModule,
    RadioButtonModule,
    ButtonModule,
    ReactiveFormsModule,
    DialogModule,
    RecommendCategoryComponent,
    CommonModule,
    MapComponent
  ],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.scss'
})
export class UpdateProductComponent {
  categories: CategoryDto[] = []
  eventTypes: CreateEventTypeResponseDTO[] = []
  displayAddCategoryForm: boolean = false;


  photosToShow: string[] = [];

  photosToAdd: PhotoToAdd[] = [];

  selectedCategory: any = null
  selectedEventTypes: any[] = []

  fbl: FormBuilder = new FormBuilder();

  productId!: number

  addProductForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    specificity: new FormControl('', [Validators.required]),
    price: new FormControl<number | undefined | null>(null, [Validators.required, Validators.min(0)]),
    discount: new FormControl<number | undefined | null>(null, [Validators.min(0), Validators.max(100)]),
    city: new FormControl<string | undefined | null>(null, [Validators.required]),
    street: new FormControl<string | undefined | null>(null, [Validators.required]),
    number: new FormControl<string | undefined | null>(null, [Validators.required]),
    latitude:new FormControl<number|null|undefined>(null, [Validators.required]),
    longitude:new FormControl<number|null|undefined>(null, [Validators.required]),
    eventTypes: new FormControl([]), 
    minDuration: new FormControl<number | undefined | null>(null, [Validators.required, Validators.min(0)]),
    maxDuration: new FormControl<number | undefined | null>(null, [Validators.required, Validators.min(0)]),
    duration: new FormControl(null), 
    reservationDeadline: new FormControl<number | undefined | null>(null, [Validators.required, Validators.min(0)]),
    cancellationDeadline: new FormControl<number | undefined | null>(null, [Validators.required, Validators.min(0)]),
    automaticReservation: new FormControl(false),
    merchandisePhotos: this.fbl.array([])
  });

  constructor(private route: ActivatedRoute, private eventTypeService: EventTypeService, private categoryService: CategoryService, private productService: ProductService, private jwtService: JwtService, 
    private fb: FormBuilder, private photoService: PhotoService
  ){

  }
  onAddressSelected(address: AddressDTO) {
    this.addProductForm.patchValue({
      city: address.city,
      street: address.street,
      number: address.number,
      latitude:address.latitude,
      longitude:address.longitude
    });
  }
  ngOnInit(){
    this.loadData();
  }

  loadData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.productId = id ? Number(id) : -1;

    this.categoryService.getAll().pipe(tap(response => {
      this.categories = response.categories;
    })).subscribe();
  
    this.eventTypeService.getAllWp().pipe(tap(response => {
      this.eventTypes = response;
    })).subscribe();
  
    this.productService.getById(this.productId).pipe(tap(response => {
      const product = response;
      this.addProductForm.patchValue({
        title: product.title,
        description: product.description,
        specificity: product.specificity,
        price: product.price,
        discount: product.discount,
        city: product.address?.city,
        street: product.address?.street,
        number: product.address?.number,
        minDuration: product.minDuration,
        maxDuration: product.maxDuration,
        reservationDeadline: product.reservationDeadline,
        cancellationDeadline: product.cancelReservation,
        automaticReservation: product.automaticReservation,
      });
  
      this.selectedEventTypes = product.eventTypes.map(x => x.id);
  
      // Populate merchandise photos
      const photosArray = this.addProductForm.get('merchandisePhotos') as FormArray;
      product.merchandisePhotos.forEach(photo => {
        photosArray.push(this.fbl.group({
          photo: new FormControl(this.getPhotoUrl(photo.photo)),
        }));
  
        // Add to photosToAdd array to keep track of uploaded photos
        this.photosToAdd.push({
          id: photo.id,
          photo: photo.photo,
        });
      });
  
      // Update photos to show in the UI
      this.updatePhotosToShow();
    })).subscribe();
  }
  

  uploadFile($event: any): void {
    const files = $event.target.files as File[];
    if (files && files.length > 0) {
        const file = files[0]; 

        const photosArray = this.addProductForm.get('merchandisePhotos') as FormArray;

        // Check if the file name already exists in the array
        const existingPhoto = photosArray.value.find((photo: { photo: string }) => photo.photo === file.name);
        
        if (!existingPhoto) {
            this.addPhoto(file.name); 
            this.photoService.uploadMerchandisePhoto(file).pipe(tap(response => {
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
    const photosArray = this.addProductForm.get('merchandisePhotos') as FormArray;
    photosArray.push(this.fbl.group({
      photo: new FormControl(photoName)
    }));
    this.updatePhotosToShow();
  }

  updatePhotosToShow(): void {
    const photosArray = this.addProductForm.get('merchandisePhotos') as FormArray;
    this.photosToShow = photosArray.value.map((photo: { photo: string }) => photo.photo);
  }

  removePhoto(index: number): void {
    const photosArray = this.addProductForm.get('merchandisePhotos') as FormArray;
  
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
      this.photoService.deleteMercPhoto(photoId, this.productId, true).pipe(
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
    const photosArray = this.addProductForm.get('merchandisePhotos') as FormArray;
    return photosArray.value as CreateMerchandisePhotoDTO[];
  }


  createProduct(): void{
    const dto: UpdateProductRequestDTO = {
      title: this.addProductForm.controls.title.value,
      description: this.addProductForm.controls.description.value,
      specificity: this.addProductForm.controls.specificity.value,
      price: this.addProductForm.controls.price.value,
      discount: this.addProductForm.controls.discount.value,
      address: {
        city: this.addProductForm.controls.city.value,
        street: this.addProductForm.controls.street.value,
        number: "",
        latitude: 0,
        longitude: 0
      },
      visible: true,
      available: true,
      minDuration: this.addProductForm.controls.minDuration.value,
      maxDuration: this.addProductForm.controls.maxDuration.value,
      reservationDeadline: this.addProductForm.controls.reservationDeadline.value,
      cancellationDeadline: this.addProductForm.controls.cancellationDeadline.value,
      automaticReservation: this.addProductForm.controls.automaticReservation.value,
      serviceProviderId: 2,//this.jwtService.getIdFromToken(),
      merchandisePhotos: this.photosToAdd.map(x => x.id),
      eventTypesIds: this.selectedEventTypes
    }
    this.productService.update(this.productId
      , dto).pipe(
      tap(response => {
      })
    ).subscribe()

  }

  showAddCategoryForm() {
    this.displayAddCategoryForm = true;
  }
  createCategory(categoryCreated: boolean) {
    if(categoryCreated) {
      this.categoryService.getAll();
    } 
    else {
      console.log("fail")
    } 

    this.displayAddCategoryForm = false;
  }
}
