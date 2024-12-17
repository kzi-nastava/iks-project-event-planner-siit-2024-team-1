import { Component } from '@angular/core';
import { EventsComponent } from '../event/events/events.component';
import { EventCalendarComponent } from '../event-calendar/event-calendar.component';

@Component({
  selector: 'app-favorite-events',
  standalone: true,
  imports: [EventsComponent,EventCalendarComponent],
  templateUrl: './favorite-events.component.html',
  styleUrl: './favorite-events.component.scss'
})
export class FavoriteEventsComponent {

}
