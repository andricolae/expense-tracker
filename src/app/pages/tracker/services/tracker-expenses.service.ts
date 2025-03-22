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

  async loadUserExpensesByInterval(
    startDate: Date,
    endDate: Date
  ): Promise<(Expense & { date: string })[]> {
    const expenses: (Expense & { date: string })[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayKey = this.convertDateToDDMMYYYY(currentDate);

      const dayExpenses = await this.expensesService
        .getExpensesOfUserByDate(this.userId, dayKey)
        .toPromise();

      if (dayExpenses) {
        // adaugi explicit data aici, deoarece Firebase nu o salvează în obiect
        const dayExpensesWithDate = dayExpenses.map((expense) => ({
          ...expense,
          date: dayKey,
        }));

        expenses.push(...dayExpensesWithDate);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.expenses.set(expenses);
    return expenses;
  }

  // Conversie Date în DD-MM-YYYY pentru a corespunde cheilor Firebase
  private convertDateToDDMMYYYY(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
