import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'expense-tracker';
  constructor(private authService: AuthService){}

  ngOnInit(): void {
    this.authService.signup('test@test.com','parola123').subscribe(response=>{
      console.log('Login succesfull:', response);
    }, error=>{
      console.log('Fail to signup!', error);
    })

    this.authService.login('test@test.com','parola123').subscribe(response=>{
      console.log('Login succesfull:', response);
    }, error=>{
      console.log('Fail to login!', error);
    })
  }
}
