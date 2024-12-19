import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SendInvitationComponent } from "../send-invitation/send-invitation.component";
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { CreateEventTypeDTO } from '../create-event-type-form/dtos/create-event-type.dto';
import { ServiceService } from '../service/service.service';
import { tap } from 'rxjs';
import { response } from 'express';
import { Service } from '../service/service';
import { ProductService } from '../product/product.service';
import { MerchandiseOverviewDTO } from '../merchandise/merchandise-overview-dto';
import { EventTypeService } from '../create-event-type-form/event-type.service';
import { CreateEventTypeResponseDTO } from '../create-event-type-form/dtos/create-event-type-response.dto';
import { CreateEventDTO } from '../my-events/dtos/CreateEvent.dto';
import { JwtService } from '../auth/jwt.service';
import { EventService } from '../event/event.service';
import { MapComponent } from '../map/map.component';
import { AddressDTO } from '../auth/register-dtos/address.dto';

@Component({
  selector: 'app-create-event-form',
  standalone: true,
  imports: [CommonModule, DropdownModule, FormsModule,MapComponent, MultiSelectModule, RadioButtonModule, ButtonModule, ReactiveFormsModule, CalendarModule, CheckboxModule, SendInvitationComponent, DialogModule],
  templateUrl: './create-event-form.component.html',
  styleUrl: './create-event-form.component.scss'
})
export class CreateEventFormComponent {
  addEventTypeForm = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    date: new FormControl<Date | null>(new Date()),
    city: new FormControl(''),
    street: new FormControl(''),
    number: new FormControl<string | null>(""),
    latitude: new FormControl<number | null>(1),
    longitude: new FormControl<number | null>(1),
    maxParticipants: new FormControl<number | null>(-1),
    public: new FormControl(),
  })

  constructor(private fb: FormBuilder, private jwtService: JwtService, private serviceService: ServiceService, 
    private productService: ProductService, private eventTypeService: EventTypeService, private eventService: EventService) {}
  
  eventTypes: CreateEventTypeResponseDTO[] = []
  selectedEventType: any = null

  services: MerchandiseOverviewDTO[] = []
  products: MerchandiseOverviewDTO[] = []

  selectedServices: any[] = []
  selectedProducts: any[] = []

    onAddressSelected(address: AddressDTO) {
        this.addEventTypeForm.patchValue({
          city: address.city,
          street: address.street,
          number: address.number,
          latitude:address.latitude,
          longitude:address.longitude
        });
      }
    

  ngOnInit(){
      this.serviceService.getAll().pipe(tap(response => {
        this.services = response
      })).subscribe()
      this.productService.getAll().pipe(tap(response => {
        this.products = response
      })).subscribe()
      this.eventTypeService.getAllWp().pipe(tap(response => {
        this.eventTypes = response
      })).subscribe()
  }

  createEvent(): void{
    let d = this.addEventTypeForm.controls.date.value
  d?.setDate(d.getDate() +1)
    const dto: CreateEventDTO = {
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
      isPublic: this.addEventTypeForm.controls.public.value,
      eventTypeId: this.selectedEventType,
      productIds: this.selectedProducts.map(x => x.id),
      serviceIds: this.selectedServices.map(x => x.id),
      organizerId: this.jwtService.getIdFromToken()
    }
    this.eventService.create(dto).pipe(tap(response => {
      
    })).subscribe()
  }
}
