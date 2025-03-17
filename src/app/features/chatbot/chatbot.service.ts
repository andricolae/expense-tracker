import { inject, Injectable, OnInit } from '@angular/core';
import { GeminiService } from '../../core/google/gemini.service';
import { HttpClient } from '@angular/common/http';
import { Message } from './models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService implements OnInit {
  private gemini = inject(GeminiService);
  private http = inject(HttpClient);

  private promt?: string;
  messages: Message[] = [];

  ngOnInit() {
    this.getPromt();
  }

  sendMessage(message: string) {
    const request = this.makePromt(message);
    this.gemini.sendRequest(request).subscribe({
      next: (response) => {
        this.processResponse(response);
      },
      error: () => {
        this.processError();
      },
    });
  }

  private processResponse(response: any) {
    let botResponse =
      this.gemini.getResponse(response) ||
      'Eroare: Nu am putut procesa mesajul.';

    // Curățăm textul primit (Markdown, caractere inutile etc.)
    botResponse = this.gemini.cleanBotResponse(botResponse);

    const botMessage: Message = { sender: 'bot', text: botResponse };
    this.messages.push(botMessage);
  }

  private processError() {
    const errorMessage: Message = {
      sender: 'bot',
      text: 'Eroare de comunicare cu Gemini.',
    };
    this.messages.push(errorMessage);
  }

  private makePromt(message: string) {
    return this.promt + message;
  }

  private getPromt() {
    this.gemini.getPromt('chatbot').subscribe((response) => {
      this.promt = response.prompt;
    });
  }
}
