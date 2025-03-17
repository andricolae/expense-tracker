import { inject, Injectable, signal } from '@angular/core';
import { ExpensesService } from '../../../features/expenses/expenses-crud/expenses.service';
import { AuthService } from '../../../core/authentication/auth.service';
import { Expense } from '../../../features/expenses/models/spending.model';

@Injectable({
  providedIn: 'root',
})
export class TrackerExpensesService {
  //user
  private authService = inject(AuthService);
  userId!: string;

  //expenses
  private expensesService = inject(ExpensesService);
  expenses = signal<Expense[]>([]);

  //initialization
  constructor() {
    this.userId = this.authService.getId()!;
  }

  loadUserExpensesByDate(day: string) {
    this.expensesService
      .getExpensesOfUserByDate(this.userId, day)
      .subscribe((response) => {
        this.expenses.set(response);
        console.log(this.expenses());
      });
  }

  //CRUD
  addExpense(day: string, newExpense: Expense) {
    this.expensesService.addExpense(this.userId, day, newExpense).then(() => {
      this.loadUserExpensesByDate(day);
    });
  }

  deleteExpense(day: string, idExpense: string) {
    this.expensesService.deleteExpense(this.userId, day, idExpense).then(() => {
      this.loadUserExpensesByDate(day);
    });
  }

  editExpense(day: string, idExpense: string, newExpense: Expense) {
    this.expensesService
      .editExpense(this.userId, day, idExpense, newExpense)
      .then(() => {
        this.loadUserExpensesByDate(day);
      });
  }
}
