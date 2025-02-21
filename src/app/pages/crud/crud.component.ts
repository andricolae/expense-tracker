import { Component } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { CreateExpenseDTO, DayOfWeek, Expense, UpdateExpenseDTO } from '../../models/expense.model';

@Component({
  selector: 'app-crud',
  imports: [],
  templateUrl: './crud.component.html',
  styleUrl: './crud.component.css'
})
export class CrudComponent {
  expenses: Expense[] = [];

  newExpense: CreateExpenseDTO = {
    name: 'Groceries',
    category: 'Food',
    amount: 50
  };

  updates: UpdateExpenseDTO = {
    name: 'Updated Lunch',
    amount: 25,
    category: 'food'
  };

  constructor(private crudService: CrudService) {}

  ngOnInit() {
    // this.addNewExpense(this.newExpense);
  }

  async addNewExpense(expense: Expense) {
    await this.crudService.addItem('monday', expense);
  }

  async deleteExpense() {
    const isDeleted = await this.crudService.deleteItem("monday", "expenseId");
    if (isDeleted) {
      console.log('Successfully deleted expense');
    } else {
      console.log('Failed to delete expense');
    }
  }

  async updateExpense() {
    const isUpdated = await this.crudService.updateItem("monday", "expenseId", this.newExpense);
    if (isUpdated) {
      console.log('Successfully updated expense');
    } else {
      console.log('Failed to update expense');
    }
  }

  async getExpensesByDay() {
    const expenses = await this.crudService.getByDay("monday");
    console.log('Expenses for Monday:', expenses);
  }

  async getExpensesByDayAndCategory() {
    const expenses = await this.crudService.getByDayAndCategory("monday", "category");
    console.log('Expenses for Monday - Food:', expenses);
  }

  async getAllExpensesForCategory() {
    const expenses = await this.crudService.getByCategoryAllDays("category");
    console.log('All Food Expenses:', expenses);

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    console.log('Total Food Expenses:', total);
  }
}
