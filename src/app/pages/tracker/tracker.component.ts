import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TrackerConfigService, TrackerConfig } from '../../services/tracker-config.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud.service';
import { CreateExpenseDTO, DayOfWeek, Expense, UpdateExpenseDTO, Category } from '../../models/expense.model';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.css']
})
export class TrackerComponent implements OnInit {

  errorMessage: string = '';
  selectedCategory: string = '';
  isSaveDisabled: boolean = true;
  expenseName: string = '';
  expenseAmount: number | null = null;

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
  categories: Category[] = [];
  newCategory = '';
  showCategoryPopup = false;
  showExpenseForm = false;
  showWeeklyOverview = false;
  dailyExpenses: Expense[] = [];

  _expenses: Expense[] = [];

  isEditing = false;
  editingExpenseId: string | null = null;
  currentUserId: string = '';


  _newExpense: CreateExpenseDTO = {
    name: '',
    category: { id: '', name: 'Groceries', isDefault: true },
    amount: 0,
    userId: '',
    timestamp: 0
  };

  _updates: UpdateExpenseDTO = {
    name: 'Updated Lunch',
    amount: 25,
    category: { id: '', name: 'Groceries', isDefault: true }
  };

  expense: any[] = [];

  expendedDayExpenses: Record<DayOfWeek, Expense[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  expendedDays: Record<DayOfWeek, boolean> = {
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  };

  editingCategory: string | null = null;
  editedCategory: string = '';

  constructor(private trackerConfigService: TrackerConfigService,
    private crudService: CrudService,
    private cdr: ChangeDetectorRef,
    private confirmDialogService: ConfirmDialogService,
    private authService: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.loadCategories();
    this.trackerConfigService.getWeekdays().subscribe((config: TrackerConfig) => {
      this.days = config.weekdays.map(day => day.name);
      this.selectedDay = this.getCurrentAvailableDay();
      this.getExpensesByDay(this.selectedDay);
    });
    this.getDailyTotal();
    this.authService.user.subscribe(user => {
      if (user) {
        this.currentUserId = user?.uid;
      }
    })
  }

  async loadCategories() {
    this.categories = await this.crudService.getCategories();
    console.log("Loaded categories:", this.categories);
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

  async toggleWeeklyOverview() {
    this.showWeeklyOverview = !this.showWeeklyOverview;
    this.showExpenseForm = false;
  
    if (this.showWeeklyOverview) {
      for (const day of this.days) {
        this.expendedDays[day] = true;
        this.expendedDayExpenses[day] = await this.crudService.getByDay(day);
      }
    }
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

  validateFormAtSave() {
    this.isSaveDisabled = !this.selectedCategory ||
      !this.expenseName ||
      !this.expenseAmount ||
      this.expenseAmount <= 0;
  }
  validateFormAtUpdate() {
    this.isSaveDisabled = false;
  }

  async saveExpense(day: DayOfWeek) {
    console.log("Saving expense with category:", this.selectedCategory);

    const selectedCategoryObj = this.categories.find(cat => cat.name === this.selectedCategory);
    if (!selectedCategoryObj) {
        console.error("Selected category not found:", this.selectedCategory);
        return;
    }

    this._newExpense.name = this.expenseName;
    this._newExpense.category = selectedCategoryObj; 
    this._newExpense.amount = this.expenseAmount!;
    this._newExpense.userId = this.currentUserId;

    this.showExpenseForm = false;
    this.resetForm();

    await this.crudService.addItem(day, this._newExpense);
    await this.getDailyTotal();
    this.getExpensesByDay(this.selectedDay);
}

  async deleteExpense(id: string) {
    this.confirmDialogService.confirm({
      message: 'Are you sure you want to delete this expense?'
    }).subscribe(async (confirmed) => {
      if (confirmed) {
        await this.crudService.deleteItem(this.selectedDay, id);
        await this.getDailyTotal();
        this.getExpensesByDay(this.selectedDay);
      }
    });
  }

  resetForm() {
    this.expenseName = "";
    this.selectedCategory = "";
    this.expenseAmount = null;
    this.isEditing = false;
    this.editingExpenseId = null;
  }

  editExpense(expense: Expense) {
    if (!expense) return;

    this.isEditing = true;
    this.editingExpenseId = expense.id;

    this.showExpenseForm = true;

    setTimeout(() => {
      this.expenseName = expense.name;
      this.selectedCategory = expense.category.name;
      this.expenseAmount = expense.amount;
    }, 0);
    this.isSaveDisabled = true;
  }

  async updateExpense() {

    if (!this.isEditing || !this.editingExpenseId)
      return;

    const selectedCategoryObj = this.categories.find(cat => cat.name === this.selectedCategory);
    if (!selectedCategoryObj) {
        console.error("Selected category not found");
        return;
    }

    const updatedExpense: UpdateExpenseDTO = {
      name: this.expenseName,
      category: selectedCategoryObj,
      amount: this.expenseAmount!,
      timestamp: Date.now()
    };

    await this.crudService.updateItem(this.selectedDay, this.editingExpenseId, updatedExpense);
    await this.getDailyTotal();

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
    return this.days.indexOf(this.selectedDay) > this.days.indexOf(this.days[today.getDay() - 1]);
  }

  isFutureDay(day: DayOfWeek): boolean {
    const today = new Date();
    const dayIndex = this.days.indexOf(day);
    const todayIndex = today.getDay() - 1; // getDay() returns 0 (Sunday) to 6 (Saturday), so adjust for array indexing
    if (todayIndex < 0) {
      // Adjust for when today is Sunday (index -1 in our array)
      return dayIndex !== 0;
    }
    return dayIndex > todayIndex;
  }

  async addCategory() {
    if (this.newCategory.trim() === '') return;
    const existingCategory = this.categories.find(cat => cat.name.toLowerCase() === this.newCategory.toLowerCase());
    if (existingCategory) {
      //alert('Category already exists!');
      return;
    }

    const newCategoryId = await this.crudService.addCategory(this.newCategory);
    if (newCategoryId) {
      this.categories.push({ id: newCategoryId, name: this.newCategory, isDefault: false });
    }
    this.newCategory = '';
    this.showCategoryPopup = false;
  }

  editCategory(category: Category) {
    if (category.isDefault) {
      //alert("You cannot edit default categories!");
      return;
    }
    this.editingCategory = category.id;
    this.editedCategory = category.name;
  }


  async saveEditedCategory() {
    if (!this.editedCategory.trim()) return;
    const categoryToUpdate = this.categories.find(cat => cat.id === this.editingCategory);
    if (categoryToUpdate && !categoryToUpdate.isDefault) {
      const success = await this.crudService.updateCategory(categoryToUpdate.id, this.editedCategory, categoryToUpdate.isDefault);
      if (success) {
        categoryToUpdate.name = this.editedCategory;
      }
    }
    this.editingCategory = null;
  }


  async deleteCategory(category: { id: string, isDefault: boolean }) {
    if (category.isDefault) {
     // alert("You cannot delete default categories!");
      return;
    }
    const success = await this.crudService.deleteCategory(category.id, category.isDefault);
    if (success) {
      this.categories = this.categories.filter(cat => cat.id !== category.id);
    }
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

  async toggleDayExpenses(day: DayOfWeek) {
    this.expendedDays[day] = !this.expendedDays[day]; 
    if (this.expendedDays[day]) {
      this.expendedDayExpenses[day] = await this.crudService.getByDay(day);
    } else {
      this.expendedDayExpenses[day] = []; 
    }
  
    this.cdr.detectChanges(); 
  }

}
