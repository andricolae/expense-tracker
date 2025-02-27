import { inject, Injectable, signal } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private geminiService = inject(GeminiService);

  message = signal<string>('');
  isVisible = signal<boolean>(false);

  showNotification(message: string) {
    this.setMessage(message);
    this.makeItVisible();
  }

  private setMessage(message: string) {
    //COMING SOON
    // this.processMessage(message).subscribe((response) => {
    //   this.message.set(response);
    // });

    this.message.set(message);
  }

  private processMessage(message: string) {
    return this.geminiService.analyzeApiError(message);
  }

  private makeItVisible() {
    this.isVisible.set(true);
    setTimeout(() => {
      this.isVisible.set(false);
    }, 5000); // Notificarea dispare după 5 secunde
  }
}
