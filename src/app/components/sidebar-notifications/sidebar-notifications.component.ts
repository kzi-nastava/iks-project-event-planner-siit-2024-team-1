import { Component } from '@angular/core';
import { NotificationService } from './notification.service';
import { NotificationDTO } from './notification-dto';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sidebar-notifications',
  standalone: true,
  imports: [TabViewModule,CardModule,CommonModule,ButtonModule],
  templateUrl: './sidebar-notifications.component.html',
  styleUrl: './sidebar-notifications.component.scss'
})
export class SidebarNotificationsComponent {
  activeTab: number = 0;
  unreadNotifications: NotificationDTO[] = [];
  readNotifications: NotificationDTO[] = [];
  userId: number = 1; // This should be obtained from your auth service

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.getUnreadNotifications(this.userId)
      .subscribe(notifications => {
        this.unreadNotifications = notifications;
      });

    this.notificationService.getReadNotifications(this.userId)
      .subscribe(notifications => {
        this.readNotifications = notifications;
      });
  }

  markAsRead(notification: NotificationDTO) {
    if (notification.id) {
      this.notificationService.markAsRead(notification.id)
        .subscribe(() => {
          this.unreadNotifications = this.unreadNotifications
            .filter(n => n.id !== notification.id);
          notification.read = true;
          this.readNotifications.push(notification);
        });
    }
  }

}
