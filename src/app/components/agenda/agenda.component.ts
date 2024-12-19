import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { CreateEventTypeFormComponent } from '../create-event-type-form/create-event-type-form.component';
import { EditEventTypeFormComponent } from '../edit-event-type-form/edit-event-type-form.component';
import { CreateActivityFormComponent } from "../create-activity-form/create-activity-form.component";
import { EditActivityFormComponent } from '../edit-activity-form/edit-activity-form.component';
import { ActivityOverviewDTO } from './activity-overview.dto';
import { EventService } from '../event/event.service';
import { tap } from 'rxjs';
import { response } from 'express';
import { CreateEventResponseDTO } from '../my-events/dtos/CreateEventResponse.dto';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [TableModule, CommonModule, ButtonModule, DialogModule, CreateActivityFormComponent, EditActivityFormComponent],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss'
})
export class AgendaComponent {
  displayAddForm: boolean = false;
  displayEditForm: boolean = false;
  event!: CreateEventResponseDTO ;

  activities: ActivityOverviewDTO[] = [];
  selectedActivity!: ActivityOverviewDTO ;
  eventId!:number;

  constructor(private eventService: EventService,private route:ActivatedRoute){}

  ngOnInit(){
    this.loadData();
  }


  loadData(): void{
    const id = this.route.snapshot.paramMap.get('id');
    this.eventId = id ? Number(id) : -1;
    this.eventService.getById(this.eventId).pipe(tap(response => {
      this.event = response
    })).subscribe()
    this.eventService.getAgenda(this.eventId).pipe(tap(response => {
      this.activities = response
    })).subscribe()
  }

  showAddForm() {
    this.displayAddForm = true;
  }

  showEditForm(a: ActivityOverviewDTO) {
    this.displayEditForm = true;
    this.selectedActivity = a;
  }

  onDelete(activityId: number): void {
    this.eventService.deleteActivity(this.eventId, activityId).pipe(tap(response => {
      
    })).subscribe()
  }
}
