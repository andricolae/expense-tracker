import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/authentication/auth.service';
import { ConfigService, MenuItem } from '../../../core/utils/config.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  menu: MenuItem[] = [];
  sticky = false;
  isAuthenticated = false;
  private userSub!: Subscription;
  menuOpen = false;

  constructor(
    private configService: ConfigService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMenu();

    this.userSub = this.authService.user.subscribe((user) => {
      this.isAuthenticated = !!user;
    });
  }

  private loadMenu(): void {
    this.configService.getConfig().subscribe((config) => {
      this.menu = config.menu.map((item) => {
        console.log('Changed menu items routes');
        return item;
      });
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth']);
    this.closeMenu();
  }

  goToLogout(): void {
    this.authService.logout();
    this.closeMenu();
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
