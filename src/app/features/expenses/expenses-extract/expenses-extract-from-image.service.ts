import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
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

  extractExpensesFromImage(
    file: File,
    categories: { id: string; name: string; visible: boolean }[]
  ): Observable<Expense[]> {
    const categoryNames = categories.map((cat) => cat.name);

    return from(this.convertFileToBase64(file)).pipe(
      switchMap((imageBase64: string) =>
        this.visionService.extractText(imageBase64)
      ),
      map((response) => this.extractTextFromVisionResponse(response)),
      switchMap((text) => {
        const prompt = `
          Extract expense data from this text and respond STRICTLY with a valid JSON array of expenses.
          Each expense should have exactly these properties:
          - "name": string
          - "amount": number
          - "date": string (DD-MM-YYYY format)
          - "category": string (choose the MOST suitable category from the provided list)
  
          Available categories: ${categoryNames.join(', ')}.
  
          Text:
          ${text}
        `;
        return this.geminiService.sendRequest(prompt);
      }),
      map((response) => this.parseGeminiResponse(response)),
      map((expenses: Expense[]) =>
        expenses.map((expense) => ({
          ...expense,
          categoryId:
            categories.find(
              (cat) => cat.name.toLowerCase() === expense.category.toLowerCase()
            )?.id || null,
        }))
      )
    );
  }

  private extractTextFromVisionResponse(response: any): string {
    return response.responses?.[0]?.fullTextAnnotation?.text || '';
  }

  private parseGeminiResponse(response: any): Expense[] {
    const text = this.geminiService.getResponse(response);
    try {
      const jsonMatch = text.match(/\[.*\]/s); // extrage JSON array din text
      if (!jsonMatch) throw new Error('No JSON array found in response.');
      const expenses: Expense[] = JSON.parse(jsonMatch[0]);
      return expenses;
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return [];
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1]; // Elimină prefixul Data URL
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
