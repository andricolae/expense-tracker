import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-notification',
  imports: [],
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
