import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";


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

    constructor(private http: HttpClient) { }

    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`, {
            email: email,
            password: password,
            returnSecureToken: true
        })
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`, {
            email: email,
            password: password,
            returnSecureToken: true

        })

    }

    resetPassword(email: string) {
        return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${this.apiKey}`, {
            requestType: "PASSWORD_RESET",
            email
        })

    }



}