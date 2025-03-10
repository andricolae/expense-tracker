import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { SpinnerService } from '../../services/spinner.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
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
    private authService: AuthService,
    private spinnerService: SpinnerService) { }

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

    this.spinnerService.showSpinner();

    if (this.isResetting) {
      this.authService.resetPassword(this.email).pipe(finalize(() => this.spinnerService.hideSpinner())).subscribe(
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
        this.spinnerService.hideSpinner();
        return;
      }

      this.authService.signup(this.email, this.password).pipe(finalize(() => this.spinnerService.hideSpinner())).subscribe({
        next: response => {
          console.log('User registered', response);
          this.isRegistering = false;
          this.resetMessage = "Account created! Please log in.";
        }
      });
    } else {
      this.authService.login(this.email, this.password).pipe(finalize(() => this.spinnerService.hideSpinner())).subscribe({
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

    this.spinnerService.showSpinner();

    this.authService.resetPassword(this.email).pipe(finalize(() => this.spinnerService.hideSpinner())).subscribe(
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