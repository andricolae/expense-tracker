import { Component } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { CreateExpenseDTO, DayOfWeek, Expense, UpdateExpenseDTO, Category } from '../../models/expense.model';

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
    category: 'Groceries',
    amount: 50
  };

  updates: UpdateExpenseDTO = {
    name: 'Updated Lunch',
    amount: 25,
    category: 'Groceries'
  };

  constructor(private crudService: CrudService) { }

  ngOnInit() {
    // this.addNewExpense("tuesday", this.newExpense);
  }

  async addNewExpense(day: DayOfWeek, expense: Expense) {
    await this.crudService.addItem(day, expense);
  }

  async deleteExpense(day: DayOfWeek, id: string) {
    const isDeleted = await this.crudService.deleteItem(day, id);
    if (isDeleted) {
      console.log('Successfully deleted expense');
    } else {
      console.log('Failed to delete expense');
    }
  }

  async updateExpense(day: DayOfWeek, id: string, newData: CreateExpenseDTO) {
    const isUpdated = await this.crudService.updateItem(day, id, newData);
    if (isUpdated) {
      console.log('Successfully updated expense');
    } else {
      console.log('Failed to update expense');
    }
  }

  async getExpensesByDay(day: DayOfWeek) {
    const expenses = await this.crudService.getByDay(day);
    console.log('Expenses for Monday:', expenses);
  }

  async getExpensesByDayAndCategory(day: DayOfWeek, category: Category) {
    const expenses = await this.crudService.getByDayAndCategory(day, category);
    console.log('Expenses for Monday - Food:', expenses);
  }

  async getAllExpensesForCategory(category: Category) {
    const expenses = await this.crudService.getByCategoryAllDays(category);
    console.log('All Food Expenses:', expenses);

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    console.log('Total Food Expenses:', total);
  }
}
