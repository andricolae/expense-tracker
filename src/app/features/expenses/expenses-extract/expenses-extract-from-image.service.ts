import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { VisionService } from '../../../core/google/vision.service';
import { GeminiService } from '../../../core/google/gemini.service';

interface Expense {
  id?: string;
  name: string;
  amount: number;
  date: string;
  category: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExpensesExtractFromImageService {
  constructor(
    private visionService: VisionService,
    private geminiService: GeminiService
  ) {}

  extractExpensesFromImage(imageBase64: string): Observable<Expense[]> {
    return this.visionService.extractText(imageBase64).pipe(
      map((response) => this.extractTextFromVisionResponse(response)),
      switchMap((text) =>
        this.geminiService.sendRequest(
          `Extract expense data from this text: ${text}`
        )
      ),
      map((response) => this.parseGeminiResponse(response))
    );
  }

  private extractTextFromVisionResponse(response: any): string {
    return response.responses?.[0]?.fullTextAnnotation?.text || '';
  }

  private parseGeminiResponse(response: any): Expense[] {
    const text = this.geminiService.getResponse(response);
    try {
      const expenses: Expense[] = JSON.parse(text);
      return expenses;
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return [];
    }
  }
}
