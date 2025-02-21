import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${environment.googleVisionApiKey}`;

  constructor(private http: HttpClient) {}

  extractText(imageBase64: string): Observable<any> {
    const requestBody = {
      requests: [
        {
          image: { content: imageBase64 },
          features: [{ type: 'TEXT_DETECTION' }],
        },
      ],
    };

    return this.http.post<any>(this.apiUrl, requestBody);
  }
}
