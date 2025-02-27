import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TrackerComponent } from './pages/tracker/tracker.component';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet, TrackerComponent],

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './components/notification/notification.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    NotificationComponent,
    ChatbotComponent,
  ],

  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor() {}
}
