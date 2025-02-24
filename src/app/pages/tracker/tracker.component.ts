import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TrackerConfigService, TrackerConfig } from '../../services/tracker-config.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud.service';
import { CreateExpenseDTO, DayOfWeek, Expense, UpdateExpenseDTO, Category } from '../../models/expense.model';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.css']
})
export class TrackerComponent implements OnInit {
  @ViewChild('expName') expNameInput!: ElementRef;
  @ViewChild('expAmount') expAmountInput!: ElementRef;
  @ViewChild('expCategory') expCategorySelect!: ElementRef;

  days: DayOfWeek[] = [];
  selectedDay: DayOfWeek = "Monday";
  categories: Category[] = ['Groceries', 'Taxes', 'Entertainment', 'Education', 'Clothing', 'Healthcare', 'Sports', 'Travel', 'Gifts', 'Miscellaneous'];
  newCategory = '';
  showCategoryPopup = false;
  showExpenseForm = false;
  showWeeklyOverview = false;
  dailyExpenses: Expense[] = [];

  _expenses: Expense[] = [];

  _newExpense: CreateExpenseDTO = {
    name: '',
    category: 'Groceries',
    amount: 0
  };

  _updates: UpdateExpenseDTO = {
    name: 'Updated Lunch',
    amount: 25,
    category: 'Groceries'
  };

  expense: any[] = [];

  constructor(private trackerConfigService: TrackerConfigService, private crudService: CrudService) {}

  ngOnInit() {
    this.trackerConfigService.getWeekdays().subscribe((config: TrackerConfig) => {
      this.days = config.weekdays.map(day => day.name);
      this.selectedDay = this.getCurrentAvailableDay();
    });
    this.getExpensesByDay(this.selectedDay);
  }

  toggleCategoryPopup() {
    this.showCategoryPopup = !this.showCategoryPopup;
    this.newCategory = '';
  }

  toggleExpenseForm() {
    this.showExpenseForm = !this.showExpenseForm;
  }

  toggleWeeklyOverview() {
    this.showWeeklyOverview = !this.showWeeklyOverview;
    this.showExpenseForm = false;
  }

  getCurrentDay(): DayOfWeek {
    const today = new Date();
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekdays[today.getDay()] as DayOfWeek;
  }

  getCurrentAvailableDay(): DayOfWeek {
    const currentDay = this.getCurrentDay() as DayOfWeek;
    return this.days.includes(currentDay) ? currentDay : this.days[0] as DayOfWeek;
  }

  expenses = [
    { name: "Lunch", category: "Food", amount: 20, day: "Monday" },
    { name: "Taxi", category: "Transport", amount: 15, day: "Monday" },
    { name: "Groceries", category: "Shopping", amount: 30, day: "Tuesday" },
    { name: "Coffee", category: "Food", amount: 5, day: "Wednesday" },
    { name: "Gym", category: "Health", amount: 40, day: "Thursday" }
  ];

  getDayExpenses(day: DayOfWeek) {
    return this.expenses.filter(expense => expense.day === day);
    // return this.getExpensesByDay(day);
  }

  getTotalWeeklyExpenses() {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  // getTotalForDay(day: string) {
  //   return this.getDayExpenses(day).reduce((total, expense) => total + expense.amount, 0);
  // }

  async getExpensesByDay(day: DayOfWeek) {
    this.dailyExpenses = await this.crudService.getByDay(day);
  }

  async saveExpense(day: DayOfWeek) {
    this._newExpense.name = this.expNameInput.nativeElement.value;
    this._newExpense.category = this.expCategorySelect.nativeElement.value;
    this._newExpense.amount = this.expAmountInput.nativeElement.value;
    this.showExpenseForm = false;
    await this.crudService.addItem(day, this._newExpense);
    this.ngOnInit();
  }

  deleteExpense(expenseId: string): void {}

  loadCategories(): void {}

  addCategory(): void {}

  deleteCategory(category: string): void {}
}
