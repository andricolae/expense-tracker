import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  message = signal<string>('');
  isVisible = signal<boolean>(true);

  showNotification(message: string) {
    this.setMessage(message);
    this.makeItVisible();
  }

  private setMessage(message: string) {
    this.message.set(message);
  }

  private makeItVisible() {
    this.isVisible.set(true);
    setTimeout(() => {
      this.isVisible.set(false);
    }, 5000); // Notificarea dispare după 5 secunde
  }
}
