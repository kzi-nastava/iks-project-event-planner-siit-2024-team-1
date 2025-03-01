import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnInit, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { CalendarModule, CalendarEvent } from 'angular-calendar';
import { subMonths, addMonths, format } from 'date-fns';
import { ButtonModule } from 'primeng/button';
import { JwtService } from '../../../infrastructure/auth/jwt.service';
import { EventOverviewDTO } from '../../../event/model/event-overview-dto';
import { EventService } from '../../../event/event.service';
import { MerchandiseOverviewDTO } from '../../merchandise/model/merchandise-overview-dto';
import { MerchandiseService } from '../../merchandise/merchandise.service';
import { ServiceService } from '../service.service';
import { CalendarTimeSlotDTO } from '../model/calendar-timeslot.dto';
import { time } from 'console';
import { start } from 'repl';

@Component({
  selector: 'app-services-calendar',
  standalone: true,
  imports: [ButtonModule, CalendarModule, CommonModule],
  templateUrl: './services-calendar.component.html',
  styleUrl: './services-calendar.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ServicesCalendarComponent implements OnInit{
  viewDate: Date = new Date();
  @Input() serviceType: string = "";

  // Converted events for angular-calendar
  calendarEvents: CalendarEvent[] = [];
  // Your original events
  timeslots: CalendarTimeSlotDTO[] = [];

  constructor(
    private eventService: EventService,
    private serviceService: ServiceService,
    private jwtService: JwtService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // Only run on browser
    switch (this.serviceType) {
      case "my":
      case "My": {
        if (isPlatformBrowser(this.platformId)) {
          this.serviceService.getCalendarTimeslots(this.jwtService.getIdFromToken()).subscribe({
            next: (data: CalendarTimeSlotDTO[]) => {
              this.timeslots = data
              this.calendarEvents = this.convertToCalendarEvents(data);
            }
          });
        }
        break;
      }
    }
  }

  // Convert EventOverviewDTO to CalendarEvent
  convertToCalendarEvents(timeslots: CalendarTimeSlotDTO[]): CalendarEvent[] {
    return timeslots.map(timeslot => ({
      title: timeslot.service + ' ' + format(new Date(timeslot.startTime), 'HH:mm') + ' - ' + format(new Date(timeslot.endTime), 'HH:mm'),
      start: new Date(timeslot.startTime),
      end: new Date(timeslot.endTime),

      meta: {
        id: timeslot.id,
        type: "",
        address: "",
        description: "",
        isPublic: ""
      }
    }));
  }

  previousMonth() {
    this.viewDate = subMonths(this.viewDate, 1);
  }

  nextMonth() {
    this.viewDate = addMonths(this.viewDate, 1);
  }
}
