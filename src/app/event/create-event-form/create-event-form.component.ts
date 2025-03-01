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
import { CreateEventTypeDTO } from '../../event-type/create-event-type-form/dtos/create-event-type.dto';
import { ServiceService } from '../../merchandise/service/service.service';
import { tap } from 'rxjs';
import { response } from 'express';
import { Service } from '../../merchandise/service/model/service';
import { ProductService } from '../../merchandise/product/product.service';
import { GetAllByCaterogiesDTO, MerchandiseOverviewDTO } from '../../merchandise/merchandise/model/merchandise-overview-dto';
import { EventTypeService } from '../../event-type/event-type.service';
import { CreateEventTypeResponseDTO } from '../../event-type/create-event-type-form/dtos/create-event-type-response.dto';
import { CreateEventDTO } from '../my-events/dtos/CreateEvent.dto';
import { JwtService } from '../../infrastructure/auth/jwt.service';
import { EventService } from '../event.service';
import { MapComponent } from '../../shared/map/map.component';
import { AddressDTO } from '../../infrastructure/auth/model/register-dtos/address.dto';
import { constrainedMemory } from 'process';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-event-form',
  standalone: true,
  imports: [CommonModule, DropdownModule, FormsModule,MapComponent, MultiSelectModule, RadioButtonModule, ButtonModule, ReactiveFormsModule, CalendarModule, CheckboxModule, DialogModule],
  templateUrl: './create-event-form.component.html',
  styleUrl: './create-event-form.component.scss'
})
export class CreateEventFormComponent {
  successMessage: string = "";

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
    public: new FormControl<boolean|null>(false)
  })

  constructor(private fb: FormBuilder, private jwtService: JwtService, private serviceService: ServiceService,
    private productService: ProductService, private eventTypeService: EventTypeService, private eventService: EventService, private router: Router) {}

  eventTypes: CreateEventTypeResponseDTO[] = []
  selectedEventType: any = null;

  successMessageText: string = '';

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

      onChange($event: any) {
        if(this.eventTypes.find(x => x.id == $event.value)?.title == 'all'){
          this.serviceService.getAll().pipe(tap(response => {
            this.services = response
          })).subscribe()
          this.productService.getAll().pipe(tap(response => {
            this.products = response
          })).subscribe()
        }
        else{
          const dto: GetAllByCaterogiesDTO = {
            categories: this.eventTypes.find(x => x.id == $event.value)?.recommendedCategories.map(x => x.id)
          }
          this.serviceService.getAllByCategories(dto).pipe(tap(response => {
            this.services = response
          })).subscribe()
          this.productService.getAllByCategories(dto).pipe(tap(response => {
            this.products = response
          })).subscribe()
        }
      }

  ngOnInit(){
      this.eventTypeService.getAllActiveWp().pipe(tap(response => {
        this.eventTypes = response
        this.selectedEventType = response.find(x => x.title == 'all')?.id
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
      productIds: this.selectedProducts,
      serviceIds: this.selectedServices,
      organizerId: this.jwtService.getIdFromToken()
    }
    this.eventService.create(dto).pipe(tap(response => {
      this.router.navigate(['home/my_events']);
      this.successMessageText = "Success!";
    })).subscribe()
  }
}
