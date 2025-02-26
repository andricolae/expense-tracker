import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, tap } from "rxjs";
import { User } from "../models/user.model";



interface AuthResponseData {
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    //registered?: boolean//optional
}

@Injectable({ providedIn: 'root' })

export class AuthService {

    private apiKey = "AIzaSyDmGuH_3Nb-RzBp0pS1xKA5wmYdbVNuruc";
    user = new BehaviorSubject<User | null>(null);

    constructor(private http: HttpClient, private router: Router) { 
        this.autoLogin();
    }

    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`, {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(tap(response => {
            this.sendVerificationEmail(response.idToken).subscribe(() => console.log("Verification mail sent!"));
        }))
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`, {
            email: email,
            password: password,
            returnSecureToken: true

        }).pipe(tap(response => {
            this.handleAuthentication(response.email, response.localId, response.idToken, +response.expiresIn);
           // this.user.next(response);
            this.router.navigate(['track']);
        }))

    }

    resetPassword(email: string) {
        return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${this.apiKey}`, {
            requestType: "PASSWORD_RESET",
            email: email
        })

    }

    logout() {
        this.user.next(null);
        console.log("User logged out!")
        this.router.navigate(['/auth']);

    }

    sendVerificationEmail(idToken: string) {
        return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${this.apiKey}`, {
            requestType: "VERIFY_EMAIL",
            idToken
        })

    }

    private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(email, userId, token, expirationDate);
        this.user.next(user);
        localStorage.setItem('userData', JSON.stringify(user)); // Store user in local storage
    }

    autoLogin() {
        const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData')!);
        if (!userData) {
            return;
        }
        const loadedUser = new User(
            userData.email,
            userData.id,
            userData._token,
            new Date(userData._tokenExpirationDate)
        );
        if (loadedUser.token) {
            this.user.next(loadedUser);
        }
    }



}