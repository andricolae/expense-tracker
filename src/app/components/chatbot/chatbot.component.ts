import { Component } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
  imports: [CommonModule, FormsModule],
})
export class ChatbotComponent {
  messages: Message[] = [];
  userInput: string = '';
  isLoading: boolean = false;

  constructor(private geminiChatService: GeminiService) {}

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userMessage: Message = { sender: 'user', text: this.userInput };
    this.messages.push(userMessage);
    this.isLoading = true;

    this.geminiChatService.sendMessage(this.userInput).subscribe((response) => {
      const botResponse =
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Eroare: Nu am putut procesa mesajul.';
      const botMessage: Message = { sender: 'bot', text: botResponse };

      this.messages.push(botMessage);
      this.isLoading = false;
    });

    this.userInput = '';
  }
}
