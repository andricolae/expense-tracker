import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${environment.geminiApiKey}`;

  constructor(private http: HttpClient) {}

  extractExpenses(ocrText: string): Observable<any> {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Extrage toate produsele și prețurile din acest bon de cumpărături:\n\n${ocrText}\n\n
              ❗ Răspunde STRICT în format JSON, fără explicații, fără text suplimentar. Structura trebuie să fie:
              [
                { "name": "Numele produsului", "price": 12.99 }
              ]
              ⚠️ ATENȚIE: Răspunde DOAR cu JSON valid, fără niciun alt caracter în plus.`,
            },
          ],
        },
      ],
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrl, requestBody, { headers });
  }
}
