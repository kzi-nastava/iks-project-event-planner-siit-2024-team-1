import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { JwtService } from '../auth/jwt.service';
import { EventTypeService } from '../create-event-type-form/event-type.service';
import { EventService } from '../event/event.service';
import { ProductService } from '../product/product.service';
import { ServiceService } from '../service/service.service';
import { CreateEventTypeResponseDTO } from '../create-event-type-form/dtos/create-event-type-response.dto';
import { MerchandiseOverviewDTO } from '../merchandise/merchandise-overview-dto';
import { tap } from 'rxjs';
import { UpdateEventDTO } from '../my-events/dtos/UpdateEvent.dto';
import { EventOverviewDTO } from '../event/event-overview-dto';
import { CreateEventResponseDTO, GetProductByIdResponseDTO, GetServiceByIdResponseDTO } from '../my-events/dtos/CreateEventResponse.dto';
import { response } from 'express';
import { formatDate } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MapComponent } from '../map/map.component';
import { AddressDTO } from '../auth/register-dtos/address.dto';

@Component({
  selector: 'app-edit-event-form',
  standalone: true,
  imports: [DropdownModule, FormsModule, MultiSelectModule,MapComponent, RadioButtonModule, ButtonModule, ReactiveFormsModule, CalendarModule, CheckboxModule ],
  templateUrl: './edit-event-form.component.html',
  styleUrl: './edit-event-form.component.scss'
})
export class EditEventFormComponent {
  addEventTypeForm = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    date: new FormControl<Date | null>(new Date()),
    city: new FormControl(''),
    street: new FormControl(''),
    number: new FormControl<string | null>(""),
    latitude: new FormControl<number | null>(1),
    longitude: new FormControl<number | null>(1),
    maxParticipants: new FormControl<number | null>(-1)  
  })
  onAddressSelected(address: AddressDTO) {
    this.addEventTypeForm.patchValue({
      city: address.city,
      street: address.street,
      number: address.number,
      latitude:address.latitude,
      longitude:address.longitude
    });
  }

  constructor(private fb: FormBuilder, private jwtService: JwtService, private serviceService: ServiceService, 
    private productService: ProductService, private eventTypeService: EventTypeService, private eventService: EventService, private route: ActivatedRoute) {
    }

  event: CreateEventResponseDTO | undefined
  
    eventId!: number

  eventTypes: CreateEventTypeResponseDTO[] = []
  selectedEventType: number | null | undefined = null

  services: MerchandiseOverviewDTO[] = []
  products: MerchandiseOverviewDTO[] = []

  selectedServices: (number | null | undefined)[] = []
  selectedProducts: (number | null | undefined)[] = []

  ngOnInit(){
    const id = this.route.snapshot.paramMap.get('id');
    this.eventId = id ? Number(id) : -1;

    this.serviceService.getAll().pipe(tap(response => {
      this.services = response
    })).subscribe()
    this.productService.getAll().pipe(tap(response => {
      this.products = response
    })).subscribe()
    this.eventTypeService.getAllWp().pipe(tap(response => {
      this.eventTypes = response
    })).subscribe()
    this.eventService.getById(this.eventId).pipe(tap(response => {
      this.event = response
      let d = this.formatDate(response.date.toString())
      this.addEventTypeForm.patchValue({
        title: response.title,
        description: response.description,
        city: response.address.city,
        street: response.address.street,
        date: d,
        number: response.address.number,
        latitude: response.address.latitude,
        longitude: response.address.longitude,
        maxParticipants: response.maxParticipants,
      });
      this.selectedEventType = response.eventType.id;
      this.selectedProducts = response.products.map(x => x.id);
      this.selectedServices = response.services.map(x => x.id);
    })).subscribe()
}
editEvent(): void{
  let d = this.addEventTypeForm.controls.date.value
  d?.setDate(d.getDate() +1)
  const dto: UpdateEventDTO = {
    title: this.addEventTypeForm.controls.title.value,
    description: this.addEventTypeForm.controls.description.value,
    date: d,
    address: {
      city: this.addEventTypeForm.controls.city.value,
      street: this.addEventTypeForm.controls.street.value,
      number: this.addEventTypeForm.controls.number.value,
      latitude: this.addEventTypeForm.controls.latitude.value,
      longitude: this.addEventTypeForm.controls.longitude.value,
    },
    maxParticipants: this.addEventTypeForm.controls.maxParticipants.value,
    eventTypeId: this.selectedEventType,
    productIds: this.selectedProducts,
    serviceIds: this.selectedServices,
    isPublic: this.event?.isPublic
  }
  this.eventService.update(this.eventId, dto).pipe(tap(response => {
    
  })).subscribe()
} 
formatDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('T')[0].split('-').map(Number);
  const date = new Date(year, month - 1, day); // Construct a Date object (month is 0-indexed)
  return date;
}

}
