import { Component } from '@angular/core';
import { OcrService } from '../../services/ocr.service';
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
  extractedExpenses: string[] = [];
  selectedFile: File | null = null;

  constructor(private ocrService: OcrService) {}

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
      const base64Image = (reader.result as string).split(',')[1]; // Eliminăm headerul
      this.ocrService.extractText(base64Image).subscribe((response) => {
        if (response.responses && response.responses.length > 0) {
          this.extractedText =
            response.responses[0].fullTextAnnotation?.text || '';
          this.extractedExpenses = this.extractExpenses(this.extractedText);
        }
      });
    };
    reader.readAsDataURL(this.selectedFile);
  }

  extractExpenses(text: string): string[] {
    const regex = /\d+[\.,]?\d{0,2}\s?(?:RON|lei)?/g;
    const matches = text.match(regex) || [];
    return matches.map((match) => match.replace(',', '.'));
  }
}
