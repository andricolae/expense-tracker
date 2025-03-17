import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from './chatbot.service';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ChatbotComponent {
  private chatbotService = inject(ChatbotService);

  messages: Message[] = this.chatbotService.messages;
  userInput: string = '';
  isOpen: boolean = false; // Pentru collapsable chat

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    this.chatbotService.ngOnInit();
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userMessage: Message = { sender: 'user', text: this.userInput };
    this.messages.push(userMessage);

    this.chatbotService.sendMessage(this.userInput);

    this.userInput = '';
  }
}
