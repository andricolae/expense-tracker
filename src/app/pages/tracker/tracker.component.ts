import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
  @ViewChild('expAmount') expAmount!: ElementRef;
  errorMessage: string = '';

  dailyTotals: { [key in DayOfWeek]: number } = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };

  days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  selectedDay: DayOfWeek = "Monday";
  categories: Category[] = ['Groceries', 'Taxes', 'Entertainment', 'Education', 'Clothing', 'Healthcare', 'Sports', 'Travel', 'Gifts', 'Miscellaneous'];
  newCategory = '';
  showCategoryPopup = false;
  showExpenseForm = false;
  showWeeklyOverview = false;
  dailyExpenses: Expense[] = [];

  _expenses: Expense[] = [];

  isEditing = false;
  editingExpenseId: string | null = null;

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

  expendedDay: DayOfWeek | null = null;
  expendedDayExpenses: Expense[] = [];

  editingCategory: string | null = null;
  editedCategory: string = '';

  constructor(private trackerConfigService: TrackerConfigService, private crudService: CrudService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.trackerConfigService.getWeekdays().subscribe((config: TrackerConfig) => {
      this.days = config.weekdays.map(day => day.name);
      this.selectedDay = this.getCurrentAvailableDay();
      this.getExpensesByDay(this.selectedDay);
    });
    this.getDailyTotal();
  }

  toggleCategoryPopup() {
    this.showCategoryPopup = !this.showCategoryPopup;
    this.newCategory = '';
  }

  toggleExpenseForm() {
    this.showExpenseForm = !this.showExpenseForm;
    if (!this.showExpenseForm) {
      this.resetForm();
    }
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
  }

  async getExpensesByDay(day: DayOfWeek) {
    this.dailyExpenses = await this.crudService.getByDay(day);
  }

  async saveExpense(day: DayOfWeek) {
    this._newExpense.name = this.expNameInput.nativeElement.value;
    this._newExpense.category = this.expCategorySelect.nativeElement.value;
    this._newExpense.amount = parseFloat(this.expAmountInput.nativeElement.value);
    this.showExpenseForm = false;
    await this.crudService.addItem(day, this._newExpense);
    this.ngOnInit();
  }

  async deleteExpense(id: string) {
    await this.crudService.deleteItem(this.selectedDay, id);
    this.ngOnInit();
  }

  resetForm() {
    this.expNameInput.nativeElement.value = "";
    this.expCategorySelect.nativeElement.value = "";
    this.expAmountInput.nativeElement.value = "";
    this.isEditing = false;
    this.editingExpenseId = null;
  }

  editExpense(expense: Expense) {
    if (!expense) return;

    this.isEditing = true;
    this.editingExpenseId = expense.id;

    this.showExpenseForm = true;

    setTimeout(() => {
      this.expNameInput.nativeElement.value = expense.name;
      this.expCategorySelect.nativeElement.value = expense.category;
      this.expAmountInput.nativeElement.value = expense.amount;
    }, 0);
  }

  async updateExpense() {
    if (!this.isEditing || !this.editingExpenseId)
      return;

    const updatedExpense: UpdateExpenseDTO = {
      name: this.expNameInput.nativeElement.value,
      category: this.expCategorySelect.nativeElement.value,
      amount: parseFloat(this.expAmountInput.nativeElement.value)
    };

    // console.log("Updated values are: Name: ", updatedExpense.name, " Amount: ", updatedExpense.amount, " Category: ", updatedExpense.category)

    await this.crudService.updateItem(this.selectedDay, this.editingExpenseId, updatedExpense);

    this.isEditing = false;
    this.editingExpenseId = null;
    this.toggleExpenseForm();
    this.getExpensesByDay(this.selectedDay);
  }

  async getDailyTotal() {
    try {
      this.dailyTotals = await this.crudService.calculateDailyTotals();
    } catch (error) {
      console.error('Error loading daily totals:', error);
    }
  }

  getWeeklyTotal() {
    return Object.values(this.dailyTotals).reduce((totalSum, dailyAmount) => totalSum + dailyAmount, 0);
  }

  onDayChanged(day: DayOfWeek) {
    this.selectedDay = day
    this.ngOnInit();
  }

  checkDay(): boolean {
    const today = new Date();
    // return this.selectedDay > this.days[today.getDay() - 1];
    return this.days.indexOf(this.selectedDay) > this.days.indexOf(this.days[today.getDay() - 1]);
  }

  loadCategories(): void { }

  addCategory(): void {
    if (this.newCategory.trim() === '') {
      return;
    }

    if (this.categories.includes(this.newCategory)) {
      alert('Category already exists!');
      return;
    }

    this.categories.push(this.newCategory);
    this.newCategory = '';
    this.showCategoryPopup = false;
  }

  editCategory(category: string): void {
    this.editingCategory = category;
    this.editedCategory = category;
  }

  saveEditedCategory(): void {
    if (!this.editedCategory.trim()) return;

    const index = this.categories.indexOf(this.editingCategory!);
    if (index !== -1) {
      this.categories[index] = this.editedCategory;
    }
    this.editingCategory = null;
  }

  deleteCategory(category: string) {
    this.categories = this.categories.filter(cat => cat !== category);
  }

  validateAmount(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    this.errorMessage = '';

    if (!value) {
      return;
    }

    const numValue = parseFloat(value);

    if (numValue <= 0) {
      this.errorMessage = 'Amount must be greater than 0';
      return;
    }

    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length > 2) {
        input.value = numValue.toFixed(2);
      }
    }
  }
  onKeyPress(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;
    const inputValue = (event.target as HTMLInputElement).value;

    if ([46, 8, 9, 27, 13].indexOf(charCode) !== -1 ||
      (charCode === 65 && event.ctrlKey === true) ||
      (charCode === 67 && event.ctrlKey === true) ||
      (charCode === 86 && event.ctrlKey === true) ||
      (charCode === 88 && event.ctrlKey === true)) {
      return true;
    }

    if (charCode === 46 && inputValue.includes('.')) {
      return false;
    }

    if (charCode === 46 || (charCode >= 48 && charCode <= 57)) {
      return true;
    }

    return false;
  }

  toggleDayExpenses(day: DayOfWeek) {
    if (this.expendedDay === day) {
      this.expendedDay = null;
      this.expendedDayExpenses = [];
    } else {
      this.expendedDay = day;
      this.getExpensesByDay(day);
      this.cdr.detectChanges();
      this.expendedDayExpenses = [...this.dailyExpenses];
    }
  }


}
