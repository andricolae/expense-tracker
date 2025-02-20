import { Component, OnInit , ChangeDetectorRef} from '@angular/core';
import { ConfigService, Config, MenuItem } from '../../services/config.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menu: MenuItem[] = [];
  sticky = false;

  constructor(
    private configService: ConfigService,
    private router: Router,
  ) {}

  goToLogin(): void {
    this.router.navigate(['/auth']);
  }
}
