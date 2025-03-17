import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private messageSubject = new BehaviorSubject<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  notification$ = this.messageSubject.asObservable();

  showNotification(message: string, type: 'success' | 'error' | 'warning') {
    this.messageSubject.next({ message, type });

    setTimeout(() => {
      this.messageSubject.next(null);
    }, 3000);
  }
  
}
