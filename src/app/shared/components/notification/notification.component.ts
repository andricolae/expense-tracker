import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, NgIf, NgClass],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  message: string = '';
  type: 'success' | 'error' | 'warning' = 'success';
  isVisible: boolean = false;
  private notificationSubscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationSubscription =
      this.notificationService.notification$.subscribe((notification) => {
        if (notification) {
          this.message = notification.message;
          this.type = notification.type;
          this.isVisible = true;
        } else {
          this.isVisible = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.notificationSubscription.unsubscribe(); // cleanup to prevent memory leaks
  }
}
