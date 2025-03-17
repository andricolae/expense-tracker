import { Component } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';

import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CommonModule, NgIf } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule, NgIf],
  templateUrl: './app.component.html',
})
export class AppComponent {
  isNotFoundPage = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.checkIfNotFoundPage();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkIfNotFoundPage();
      });
  }

  private checkIfNotFoundPage() {
    this.isNotFoundPage = this.router.url === '/404';
  }
}
