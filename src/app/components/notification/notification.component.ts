import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent {
  @Input() message: string = 'A apărut o eroare!';
  isVisible: boolean = false;

  ngOnInit() {
    this.showNotification();
  }

  showNotification() {
    this.isVisible = true;
    setTimeout(() => {
      this.isVisible = false;
    }, 5000); // Notificarea dispare după 5 secunde
  }
}
