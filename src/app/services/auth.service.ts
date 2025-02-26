import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, tap } from "rxjs";



interface AuthResponseData {
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean//optional
}

@Injectable({ providedIn: 'root' })

export class AuthService {

    private apiKey = "AIzaSyDmGuH_3Nb-RzBp0pS1xKA5wmYdbVNuruc";
    user = new BehaviorSubject<AuthResponseData | null>(null);

    constructor(private http: HttpClient, private router: Router) { }

    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`, {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(tap(response => {
            this.sendVerificationEmail(response.idToken).subscribe(()=>console.log("Verification mail sent!"));
        }))
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`, {
            email: email,
            password: password,
            returnSecureToken: true

        }).pipe(tap(response => {
            this.user.next(response);
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

    sendVerificationEmail(idToken: string){
        return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${this.apiKey}`, {
            requestType: "VERIFY_EMAIL",
            idToken
          })

    }      
    



}