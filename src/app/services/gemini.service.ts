import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { firebaseConfig } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${firebaseConfig.geminiApiKey}`;

  constructor(private http: HttpClient) {}

  extractExpenses(ocrText: string): Observable<any> {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Extrage toate produsele și prețurile din acest bon de cumpărături:\n\n${ocrText}\n\n
              Identifică și categoria fiecărui produs pe baza numelui. 
  
              ✅ Răspunde STRICT în format JSON valid, fără text suplimentar. Structura trebuie să fie:
              [
                { "name": "Numele produsului", "price": 12.99, "category": "Categorie" }
              ]
  
              🔹 Exemple de categorii posibile: 
              - "Alimente" (Carne, Lactate, Fructe, Legume, Pâine)
              - "Băuturi" (Apă, Suc, Cafea, Bere, Vin)
              - "Produse de curățenie" (Detergent, Șervețele)
              - "Electrocasnice" (Baterii, Cabluri, Becuri)
              - "Diverse" (Sacoșe, Pungi, Articole neclasificate)
  
              ⚠️ ATENȚIE: Răspunde DOAR cu JSON valid, fără niciun alt caracter în plus. Nu include ghilimele externe.`,
            },
          ],
        },
      ],
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrl, requestBody, { headers });
  }

  sendMessage(message: string): Observable<any> {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Ești un asistent financiar. Răspunde la întrebările despre educație financiară într-un mod clar și prietenos. Întrebarea utilizatorului este: "${message}"`,
            },
          ],
        },
      ],
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrl, requestBody, { headers });
  }
}
