import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
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
  confirmPassword = '';
  isAuthenticated = false;
  isResetting = false;
  resetMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    })
  }

  toggleMode() {
    this.isRegistering = !this.isRegistering;
    this.confirmPassword = '';
    this.isResetting = false;
    this.resetMessage = '';
  }

  toggleReset() {
    this.isResetting = !this.isResetting;
    this.isRegistering = false;
    this.resetMessage = '';
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    if (this.isResetting) {
      this.authService.resetPassword(this.email).subscribe(
        () => {
          this.resetMessage = "Password reset link has been sent to your email.";
        },
        error => {
          console.error(error);
          this.resetMessage = "Error: Unable to send reset email.";
        }
      );
    } else if (this.isRegistering) {
      if (this.password !== this.confirmPassword) {
        this.resetMessage = "Passwords do not match!";
        return;
      }

      this.authService.signup(this.email, this.password).subscribe({
        next: response => {
          console.log('User registered', response);
          this.isRegistering = false;
          this.resetMessage = "Account created! Please log in.";
        }
      });
    } else {
      this.authService.login(this.email, this.password).subscribe({
        next: response => {
          console.log('User logged in!', response);
          this.router.navigate(['/track']);
        }
      });
    }

    form.reset();
  }

  resetPassword() {
    if (!this.email) {
      this.resetMessage = "Please enter your email.";
      return;
    }

    this.authService.resetPassword(this.email).subscribe(
      () => {
        this.resetMessage = "Password reset link has been sent to your email!";
      },
      (error) => {
        console.error(error);
        this.resetMessage = "Unable to send reset email.";
      }
    );
  }

}