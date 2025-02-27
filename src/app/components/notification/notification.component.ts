import { Component, inject, input, OnInit, signal } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification',
  imports: [],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent {
  private notificationService = inject(NotificationService);
  isVisible = this.notificationService.isVisible;
  message = this.notificationService.message;
}
