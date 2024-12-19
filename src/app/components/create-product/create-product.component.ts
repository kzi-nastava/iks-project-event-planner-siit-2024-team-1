import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CategoryDto, CreateCategoryDto } from '../category/category.dto';
import { CreateEventTypeResponseDTO } from '../create-event-type-form/dtos/create-event-type-response.dto';
import { EventTypeService } from '../create-event-type-form/event-type.service';
import { CategoryService } from '../category/category.service';
import { ProductService } from '../product/product.service';
import { response } from 'express';
import { tap } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { AddCategoryComponent } from '../category/add-category/add-category.component';
import { CreateProductRequestDTO } from './dto/create-product.dto';
import { JwtService } from '../auth/jwt.service';
import { RecommendCategoryComponent } from '../category/recommend-category/recommend-category.component';
import { CreateMerchandisePhotoDTO, PhotoToAdd } from '../merchandise/merchandise-photos-request-dto';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../photos/photo.service';
import { MapComponent } from "../map/map.component";
import { AddressDTO } from '../auth/register-dtos/address.dto';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    MultiSelectModule,
    RadioButtonModule,
    ButtonModule,
    ReactiveFormsModule,
    CommonModule,
    DialogModule,
    RecommendCategoryComponent,
    MapComponent
  ],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
})

export class CreateProductComponent {
  categories: CategoryDto[] = [];
  eventTypes: CreateEventTypeResponseDTO[] = [];
  selectedCategory: any = null;
  selectedEventTypes: any[] = [];
  displayAddCategoryForm: boolean = false;
  photosToShow: string[] = [];

  photosToAdd: PhotoToAdd[] = [];

  fbl: FormBuilder = new FormBuilder();

  addProductForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    specificity: new FormControl('', [Validators.required]),
    price: new FormControl(null, [Validators.required, Validators.min(0)]),
    discount: new FormControl(null, [Validators.min(0), Validators.max(100)]),
    category: new FormControl(null, [Validators.required]),
    city: new FormControl<string|null|undefined>(null, [Validators.required]),
    street: new FormControl<string|null|undefined>(null, [Validators.required]),
    number: new FormControl<string|null|undefined>(null, [Validators.required]),
    latitude:new FormControl<number|null|undefined>(null, [Validators.required]),
    longitude:new FormControl<number|null|undefined>(null, [Validators.required]),
    eventTypes: new FormControl([]),
    minDuration: new FormControl(null, [Validators.required, Validators.min(0)]),
    maxDuration: new FormControl(null, [Validators.required, Validators.min(0)]),
    duration: new FormControl(null),
    reservationDeadline: new FormControl(null, [Validators.required, Validators.min(0)]),
    cancellationDeadline: new FormControl(null, [Validators.required, Validators.min(0)]),
    automaticReservation: new FormControl(false),
    merchandisePhotos: this.fbl.array([])
  });

  constructor(private eventTypeService: EventTypeService, private categoryService: CategoryService, private productService: ProductService, private jwtService: JwtService,
    private photoService: PhotoService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.categoryService.getAll().pipe(tap(response => {
      this.categories = response.categories;
    })).subscribe();
    this.eventTypeService.getAllWp().pipe(tap(response => {
      this.eventTypes = response;
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

  onAddressSelected(address: AddressDTO) {
    this.addProductForm.patchValue({
      city: address.city,
      street: address.street,
      number: address.number,
      latitude:address.latitude,
      longitude:address.longitude
    });
  }

  getPhotoUrl(photo: string): string {
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
    const photoName = photosArray.at(index).value.photo;

    this.photoService.deleteMercPhoto(this.photosToAdd.find(photo => photo.photo === photoName)?.id, -1, false).pipe(
      tap(response => {

      })
    ).subscribe();

    // Remove the corresponding photo from photosToAdd by matching the photo name
    const photoIndex = this.photosToAdd.findIndex(photo => photo.photo === photoName);
    if (photoIndex !== -1) {
      this.photosToAdd.splice(photoIndex, 1);
    }


    // Remove the photo from the FormArray
    photosArray.removeAt(photoIndex);

    // Update the list of photos to show
    this.updatePhotosToShow();
  }


  getPhotos(): CreateMerchandisePhotoDTO[] {
    const photosArray = this.addProductForm.get('merchandisePhotos') as FormArray;
    return photosArray.value as CreateMerchandisePhotoDTO[];
  }

  createProduct(): void {
    const dto: CreateProductRequestDTO = {
      title: this.addProductForm.controls.title.value,
      description: this.addProductForm.controls.description.value,
      specificity: this.addProductForm.controls.specificity.value,
      price: this.addProductForm.controls.price.value,
      discount: this.addProductForm.controls.discount.value,
      address: {
        city: this.addProductForm.controls.city.value,
        street: this.addProductForm.controls.street.value,
        number: this.addProductForm.controls.number.value,
        latitude: this.addProductForm.controls.latitude.value,
        longitude: this.addProductForm.controls.longitude.value
      },
      visible: true,
      available: true,
      minDuration: this.addProductForm.controls.minDuration.value,
      maxDuration: this.addProductForm.controls.maxDuration.value,
      reservationDeadline: this.addProductForm.controls.reservationDeadline.value,
      cancellationDeadline: this.addProductForm.controls.cancellationDeadline.value,
      automaticReservation: this.addProductForm.controls.automaticReservation.value,
      serviceProviderId: 2, //this.jwtService.getIdFromToken(),
      merchandisePhotos: this.photosToAdd.map(x => x.id),
      eventTypesIds: this.selectedEventTypes,
      categoryId: this.selectedCategory,
    };
    this.productService.create(dto).pipe(
      tap(response => {
        // handle response if needed
      })
    ).subscribe();
  }

  showAddCategoryForm() {
    this.displayAddCategoryForm = true;
  }

  createCategory(categoryCreated: boolean) {
    if (categoryCreated) {
      this.categoryService.getAll();
    } else {
      console.log("fail");
    }
    this.displayAddCategoryForm = false;
  }
}
