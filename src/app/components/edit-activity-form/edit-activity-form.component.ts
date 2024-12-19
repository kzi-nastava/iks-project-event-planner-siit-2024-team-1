import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ActivityOverviewDTO, CreateActivityDTO } from '../agenda/activity-overview.dto';
import { EventService } from '../event/event.service';
import { tap } from 'rxjs';
import { MapComponent } from '../map/map.component';
import { AddressDTO } from '../auth/register-dtos/address.dto';

@Component({
  selector: 'app-edit-activity-form',
  standalone: true,
  imports: [DropdownModule, FormsModule, MultiSelectModule, RadioButtonModule,MapComponent, ButtonModule, ReactiveFormsModule, CalendarModule],
  templateUrl: './edit-activity-form.component.html',
  styleUrl: './edit-activity-form.component.scss'
})
export class EditActivityFormComponent {
  @Input() activity!: ActivityOverviewDTO;
  @Output() activityDataUpdated = new EventEmitter<boolean>();

  addActivityForm = new FormGroup({
    title: new FormControl<string | null>(''),
    description: new FormControl(''),
    start: new FormControl<Date | null>(new Date()),
    end: new FormControl<Date | null>(new Date()),
    city: new FormControl(''),
    street: new FormControl(''), 
    number: new FormControl<string | null | undefined>(""), 
    latitude: new FormControl<number | null | undefined>(1), 
    longitude: new FormControl<number | null | undefined>(1), 
  });
  onAddressSelected(address: AddressDTO) {
    this.addActivityForm.patchValue({
      city: address.city,
      street: address.street,
      number: address.number,
      latitude:address.latitude,
      longitude:address.longitude
    });
  }

  constructor(private fb: FormBuilder, private eventService: EventService) {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['activity'] && changes['activity'].currentValue) {
      const data = changes['activity'].currentValue;
      this.addActivityForm.patchValue({
        title: this.activity.title,
        description:  this.activity.description, 
        start: this.activity.startTime,
        end: this.activity.endTime,
        city: this.activity.address?.city,
        street: this.activity.address?.street,
        number: this.activity.address?.number,
        latitude: this.activity.address?.latitude,
        longitude: this.activity.address?.longitude
      });
    }
  }

  createActivity(){
    const dto: CreateActivityDTO = {
      title: this.addActivityForm.controls.title.value,
      description: this.addActivityForm.controls.description.value,
      startTime: this.addActivityForm.controls.start.value,
      endTime: this.addActivityForm.controls.end.value,
      address: {
        city: this.addActivityForm.controls.city.value,
      street: this.addActivityForm.controls.street.value,
      number: this.addActivityForm.controls.number.value,
      latitude: this.addActivityForm.controls.latitude.value,
      longitude: this.addActivityForm.controls.longitude.value,
      }
    }
    this.eventService.updateActivity(this.activity.id, dto).pipe(tap(response => {
      console.log(response)
    })).subscribe()
  }
}
