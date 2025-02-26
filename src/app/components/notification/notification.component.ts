import { CommonModule } from '@angular/common';
import { Component, input, Input, signal } from '@angular/core';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent {
  message = input.required<string>();
  isVisible = signal<boolean>(true);

  ngOnInit() {
    this.showNotification();
  }

  showNotification() {
    this.isVisible.set(true);
    setTimeout(() => {
      this.isVisible.set(false);
    }, 5000); // Notificarea dispare după 5 secunde
  }
}
