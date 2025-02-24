import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  email = '';
  password = '';
  isRegistering = false;


  constructor(
    private router: Router,
    private authService: AuthService
  ) { }


  toggleMode() {
    this.isRegistering = !this.isRegistering;
  }

  onSubmit() {
    if (this.isRegistering) {
      //sign up user
      this.authService.signup(this.email, this.password).subscribe({
        next: (response => {
          console.log('User registered', response);
          this.authService.user.next(response);
          this.isRegistering = false;
        })
      })
    }
    else {
      //log in user
      this.authService.login(this.email, this.password).subscribe({
        next: (response => {
          console.log('User logged in!', response);
          this.authService.user.next(response);
          this.router.navigate(['/home']);
        })
      })
    }

  }

  resetPassword() {
    const email = prompt("Please enter your email for password reset:");
    if (email) {
      this.authService.resetPassword(email).subscribe(() => {
        alert("Password reset link has been sent to your email.");
      }, (error) => {
        console.error(error);
      });
    }

  }

}