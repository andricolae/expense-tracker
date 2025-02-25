import { Component, OnInit , ChangeDetectorRef} from '@angular/core';
import { ConfigService, Config, MenuItem } from '../../services/config.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


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
  isAuthenticated = false;

  constructor(
    private configService: ConfigService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  
      this.loadMenu();

      this.authService.user.subscribe(user=>{
        this.isAuthenticated = !!user;
      });
    }

  private loadMenu(): void {
    this.configService.getConfig().subscribe((config) => {
      this.menu = config.menu.map(item => {
        
        console.log("Changed menu items routes")
        return item;
      });
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth']);
  }

  goToLogout(): void {
    this.authService.logout();
  }
}
