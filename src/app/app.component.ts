import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { UploadReceiptComponent } from './components/upload-receipt/upload-receipt.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CommonModule,
    UploadReceiptComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor() {}
}
