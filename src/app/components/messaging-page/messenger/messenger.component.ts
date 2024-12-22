import { Component, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { UserOverviewDTO } from '../../user/user-overview-dto';
import { UserService } from '../../user/user.service';
import { JwtService } from '../../auth/jwt.service';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ScrollPanel, ScrollPanelModule } from 'primeng/scrollpanel';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { MessageDTO } from '../message-dto';
import { MessengerService } from '../messenger.service';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserReportDTO } from '../user-report-dto';
import { UserReportService } from '../user-report.service';
import { WebSocketService } from '../../../web-socket.service';
import { MessageRequestDTO } from '../message-request-dto';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [ButtonModule, DataViewModule, CommonModule, ToastModule,AvatarModule,InputTextareaModule, ScrollPanelModule, PanelModule, InputTextModule, DialogModule,InputTextModule,DividerModule, FormsModule],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.scss',
  providers: [DialogService,MessageService]
})
export class MessengerComponent implements OnInit {
  constructor(private route: ActivatedRoute, private userService: UserService, public jwtService: JwtService, private messengerService: MessengerService,private messageService:MessageService,private userReportService:UserReportService, private webSocketService: WebSocketService) { }
  users: UserOverviewDTO[] = [];
  selectedUser: any = null;
  messages: MessageDTO[] = [];
  messageContent: string = "";
  showMessages:boolean=false;
  @ViewChild('messagePanel') messagePanel!: ScrollPanel;
  reportDialogVisible: boolean = false;
  reportReason: string = '';
  isSubmitting: boolean = false;

  onUserSelect(user: any) {
    this.selectedUser = user;
    this.loadMessages();
  }

  loadMessages() {
    this.messengerService.getMessagesBySenderAndRecipient(
      this.jwtService.getIdFromToken(),
      this.selectedUser.id
    ).subscribe({
      next: (response) => {
        this.messages = response;
        this.scrollToBottom();
        this.showMessages=true;
      },
      error: (err) => {
        console.error('Error fetching messages', err);
      }
    });
  }

  sendMessage() {
    if(!this.messageContent.trim()) return;
    const newMessage: MessageRequestDTO = {
      senderId: this.jwtService.getIdFromToken(),
      receiverId: this.selectedUser.id,
      content: this.messageContent
    };

    this.webSocketService.sendMessage(newMessage);
    this.messageContent = '';
    this.scrollToBottom();
  }

  // Scroll to bottom of message panel
  scrollToBottom() {
    setTimeout(() => {
      if (this.messagePanel) {
        const element = this.messagePanel.el.nativeElement.getElementsByClassName('p-scrollpanel-content')[0];
        if (element) {
          element.scrollTop = element.scrollHeight;
        }
      }
    }, 100);
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.userService.getServiceProvidersForOrganizerEvents(this.jwtService.getIdFromToken(), this.jwtService.getRoleFromToken()).subscribe({
        next: (response) => {
          this.users = response;
        },
        error: (err) => {
          console.error('Error fetching service providers', err);
        },
      });
    }

    const serviceProviderId = this.route.snapshot.paramMap.get('serviceProviderId') ? Number(this.route.snapshot.paramMap.get('serviceProviderId')) : -1;
    if(serviceProviderId !== -1) {
      this.userService.getServiceProviderById(serviceProviderId).subscribe({
        next: (response) => {
          this.onUserSelect(response);
          // this.selectedUser = response;
          // this.loadMessages();
        },
        error: (err) => {
          console.error(err);
        }
      });
    }

    this.webSocketService.onMessageReceived().subscribe((message) => {
      this.messages.push(message);
      this.scrollToBottom();
    });
  }
  openReportDialog() {
    // Reset report reason when opening dialog
    this.reportReason = '';
    this.reportDialogVisible = true;
  }

  cancelReport() {
    this.reportDialogVisible = false;
    this.reportReason = '';
  }

  submitReport() {
    if (!this.selectedUser) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'No user selected to report', 
        life: 3000 
      });
      return;
    }

    if (this.reportReason.trim()) {
      // Prevent multiple submissions
      this.isSubmitting = true;

      // Prepare report DTO
      const reportRequest: UserReportDTO = {
        reporterId:this.jwtService.getIdFromToken(),
        reportedUserId: this.selectedUser.id,
        reason: this.reportReason.trim()
      };

      // Submit report via service
      this.userReportService.reportUser(reportRequest).subscribe({
        next: (response) => {
          // Success handling
          this.messageService.add({ 
            severity: 'success', 
            summary: 'User Reported', 
            detail: 'The user has been reported successfully', 
            life: 3000 
          });
          this.reportDialogVisible = false;
          this.reportReason = '';
        },
        error: (error) => {
          // Error handling
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Report Failed', 
            detail: error.message || 'Unable to submit report', 
            life: 3000 
          });
        },
        complete: () => {
          // Reset submission state
          this.isSubmitting = false;
        }
      });
    } else {
      // Show error toast if no reason provided
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Report Failed', 
        detail: 'Please provide a reason for reporting', 
        life: 3000 
      });
    }
  }


}
