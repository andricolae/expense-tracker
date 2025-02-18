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

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}', {
            email: email,
            password: password,
            returnSecureToken: true

        })

    }


}