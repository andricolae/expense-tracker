import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Expense } from '../models/spending.model';
import { RealtimeDatabaseService } from '../../../core/firebase/realtime-database.service';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  constructor(private dbService: RealtimeDatabaseService<Expense>) {}

  getAllExpensesOfUser(userId: string, date: string): Observable<Expense[]> {
    return this.dbService.getAll(`/user/${userId}/expenses/${date}`);
  }

  async addExpense(
    userId: string,
    date: string,
    expense: Expense
  ): Promise<string> {
    return await this.dbService.add(
      `/user/${userId}/expenses/${date}`,
      expense
    );
  }

  async editExpense(
    userId: string,
    date: string,
    expenseId: string,
    updatedExpense: Expense
  ): Promise<void> {
    await this.dbService.update(
      `/user/${userId}/expenses/${date}`,
      expenseId,
      updatedExpense
    );
  }

  async deleteExpense(
    userId: string,
    date: string,
    expenseId: string
  ): Promise<void> {
    await this.dbService.delete(`/user/${userId}/expenses/${date}`, expenseId);
  }

  getExpensesOfUserByDate(userId: string, date: string): Observable<Expense[]> {
    return this.dbService.getAll(`/user/${userId}/expenses/${date}`);
  }

  async getExpensesOfUserByIntervalOfTime(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Expense[]> {
    let expenses: Expense[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    while (start <= end) {
      const dateStr = start.toISOString().split('T')[0];
      const dayExpenses = await this.dbService
        .getAll(`/user/${userId}/expenses/${dateStr}`)
        .toPromise();
      expenses = expenses.concat(dayExpenses!);
      start.setDate(start.getDate() + 1);
    }

    return expenses;
  }
}
