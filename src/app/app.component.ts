import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TrackerComponent } from "./pages/tracker/tracker.component";

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet, TrackerComponent],

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule, ],  

  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor() {}
}
