import { Component } from '@angular/core';
import { OcrService } from '../../services/ocr.service';
import { GeminiService } from '../../services/gemini.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-receipt',
  templateUrl: './upload-receipt.component.html',
  styleUrls: ['./upload-receipt.component.scss'],
  imports: [CommonModule],
})
export class UploadReceiptComponent {
  imageUrl: string | ArrayBuffer | null = null;
  extractedText: string = '';
  extractedExpenses: { name: string; price: number }[] = [];
  selectedFile: File | null = null;

  constructor(
    private ocrService: OcrService,
    private geminiService: GeminiService
  ) {}

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];

      const reader = new FileReader();
      reader.onload = (e) => (this.imageUrl = e.target!.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  processImage(): void {
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = (reader.result as string).split(',')[1];
      this.ocrService.extractText(base64Image).subscribe((response) => {
        if (response.responses && response.responses.length > 0) {
          this.extractedText =
            response.responses[0].fullTextAnnotation?.text || '';
          this.sendToGemini(this.extractedText);
        }
      });
    };
    reader.readAsDataURL(this.selectedFile);
  }

  sendToGemini(ocrText: string): void {
    this.geminiService.extractExpenses(ocrText).subscribe((response) => {
      try {
        const rawText = response.candidates[0].content.parts[0].text;

        // Eliminăm spațiile inutile și verificăm dacă răspunsul începe cu [
        if (!rawText.trim().startsWith('[')) {
          throw new Error('Răspunsul nu este JSON valid!');
        }

        this.extractedExpenses = JSON.parse(rawText);
      } catch (error) {
        console.error('Eroare la parsarea răspunsului Gemini:', error);
        this.extractedExpenses = []; // Evităm să avem date invalide în UI
      }
    });
  }
}
