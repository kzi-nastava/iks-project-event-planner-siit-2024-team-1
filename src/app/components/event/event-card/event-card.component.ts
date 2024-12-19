import { Component, Input, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Event } from '../event';
import { CommonModule } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';

import { EventOverviewDTO } from '../event-overview-dto';
import { Router } from '@angular/router';
import { SendInvitationComponent } from "../../send-invitation/send-invitation.component";
import { DialogModule } from 'primeng/dialog';


@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [ButtonModule, CardModule, CommonModule, PanelModule, AvatarModule, DividerModule, SendInvitationComponent, DialogModule],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.scss'
})
export class EventCardComponent{
  @Input() event!: EventOverviewDTO;
  displayInviteForm: boolean = false;

  constructor(private router: Router){}

  showAgenda(eventId: number){
    this.router.navigate(['home/agenda',eventId]);
  }

  showEditEventForm(eventId: number){
    this.router.navigate(['home/edit-event', eventId])
  }

  showInvitationsForm(){
    this.displayInviteForm = true;
  }

  showDetails(eventId: number){
    this.router.navigate(['home/event-details', eventId])
  }
}
