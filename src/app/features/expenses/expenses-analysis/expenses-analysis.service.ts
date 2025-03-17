import { inject, Injectable, OnInit, signal } from '@angular/core';
import { GeminiService } from '../../../core/google/gemini.service';
import { DaySpending } from '../models/spending.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesAnalysisService implements OnInit {
  private gemini = inject(GeminiService);
  private promt?: string;

  weeklyAnalysis = signal<string>('');

  ngOnInit(): void {
    this.getPromt();
  }

  sendWeeklyExpensesToGemini(spendings: DaySpending[]) {
    const expensesText = this.convertSpendingsToString(spendings);
    this.analysisForWeeklyExpenses(expensesText);
  }

  private analysisForWeeklyExpenses(expensesText: string) {
    const request = this.makePrompt(expensesText);
    this.gemini.sendRequest(request).subscribe((response) => {
      const resp = this.gemini.getResponse(response);
      this.weeklyAnalysis.set(resp);
    });
  }

  private makePrompt(message: string) {
    return `${message}. ${this.promt}`;
  }

  private convertSpendingsToString(spendings: DaySpending[]) {
    const allExpenses = spendings.flatMap((day) => day.expenses);
    const expensesText = allExpenses
      .map((exp) => `${exp.category} - ${exp.name}: ${exp.amount} RON`)
      .join('\n');
    return expensesText;
  }

  private getPromt() {
    this.gemini.getPromt('expenses-analysis').subscribe((response) => {
      this.promt = response.prompt;
    });
  }
}
