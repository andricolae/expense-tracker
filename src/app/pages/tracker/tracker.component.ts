import { Component, OnInit } from '@angular/core';
import { TrackerConfigService, TrackerConfig } from '../../services/tracker-config.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.css']
})
export class TrackerComponent implements OnInit {
  days: string[] = [];
  selectedDay = '';
  categories: string[] = [];
  newCategory = '';
  showCategoryPopup = false;
  showExpenseForm = false;
  showWeeklyOverview = false;

  expense: any[] = [];

  constructor(private trackerConfigService: TrackerConfigService) {}

  ngOnInit() {
    this.trackerConfigService.getWeekdays().subscribe((config: TrackerConfig) => {
      this.days = config.weekdays.map(day => day.name);
      this.selectedDay = this.getCurrentAvailableDay();
    });
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

  getCurrentDay(): string {
    const today = new Date();
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekdays[today.getDay()];
  }

  getCurrentAvailableDay(): string {
    const currentDay = this.getCurrentDay();
    return this.days.includes(currentDay) ? currentDay : this.days[0]; 
  }

  expenses = [
    { name: "Lunch", category: "Food", amount: 20, day: "Monday" },
    { name: "Taxi", category: "Transport", amount: 15, day: "Monday" },
    { name: "Groceries", category: "Shopping", amount: 30, day: "Tuesday" },
    { name: "Coffee", category: "Food", amount: 5, day: "Wednesday" },
    { name: "Gym", category: "Health", amount: 40, day: "Thursday" }
  ];

  getDayExpenses(day: string) {
    return this.expenses.filter(expense => expense.day === day);
  }

  getTotalWeeklyExpenses() {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  getTotalForDay(day: string) {
    return this.getDayExpenses(day).reduce((total, expense) => total + expense.amount, 0);
  }


  // To imlement

  saveExpense(): void {}

  deleteExpense(expenseId: string): void {}

  loadCategories(): void {}

  addCategory(): void {}

  deleteCategory(category: string): void {}
}
