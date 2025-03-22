import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { PieComponent } from '../../shared/components/pie/pie.component';
import { SpinnerService } from '../../shared/services/spinner.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { NotificationService } from '../../shared/services/notification.service';
import { AuthService } from '../../core/authentication/auth.service';
import { ChatbotComponent } from '../../features/chatbot/chatbot.component';
import { ExpensesAnalysisService } from '../../features/expenses/expenses-analysis/expenses-analysis.service';
import { TrackerCategoryService } from './services/tracker-category.service';
import {
  DayExpense,
  DaySpending,
  Expense,
  ExpenseWithDate,
} from '../../features/expenses/models/spending.model';
import { TrackerExpensesService } from './services/tracker-expenses.service';
import { NotificationComponent } from '../../shared/components/notification/notification.component';
import { ExpensesExtractFromImageService } from '../../features/expenses/expenses-extract/expenses-extract-from-image.service';
import { finalize } from 'rxjs';
import { DaysFunctionsService } from '../../core/utils/days-functions.service';
import { ExpensesExportService } from '../../features/expenses/expenses-export/excel-export.service';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PieComponent,
    ChatbotComponent,
    NotificationComponent,
    NgIf,
    LoadingSpinnerComponent,
  ],
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.css'],
})
export class TrackerComponent implements OnInit {
  //CATEGORIES V2 -------------------------------------------------------
  private trackerCategoriesService = inject(TrackerCategoryService);
  categories = this.trackerCategoriesService.categories;

  private loadCategories() {
    this.trackerCategoriesService.getCategories();
  }

  addCategory() {
    this.trackerCategoriesService.addCategory(this.newCategory);
  }

  deleteCategory(categoryId: string) {
    this.trackerCategoriesService.deleteCategory(categoryId);
  }

  editCategory(category: { id: string; name: string }) {
    // this.editingCategory = category.id;
    // this.editedCategory = category.name; ??????????????????
  }

  saveEditedCategory(categoryId: string) {}

  //EXPENSES V2  -------------------------------------------------------

  private trackerExpensesService = inject(TrackerExpensesService);
  expenses = this.trackerExpensesService.expenses;

  loadExpenses(date: string) {
    this.trackerExpensesService.loadUserExpensesByDate(date);
  }

  addExpense(newExpense: Expense, day: string) {
    this.trackerExpensesService.addExpense(day, newExpense);
  }

  updateExpense(day: string): void {
    const updatedExpense = this.updatedItem();
    this.resetSavingForm();
    this.trackerExpensesService.editExpense(
      day,
      updatedExpense.id!,
      updatedExpense
    );
  }

  private delete(day: string, idExpense: string) {
    this.trackerExpensesService.deleteExpense(day, idExpense);
  }

  //EXTRACT FROM IMAGE V2  -------------------------------------------------------

  private expensesExtractService = inject(ExpensesExtractFromImageService);

  imageUrl: string | ArrayBuffer | null = null;
  extractedText: string = '';
  selectedFile: File | null = null;
  loading: boolean = false;
  extractedExpenses: any = null;

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];

      const reader = new FileReader();
      reader.onload = (e) => (this.imageUrl = e.target!.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  processImage(): void {
    if (!this.selectedFile) {
      console.error('No file selected!');
      return;
    }

    this.loading = true;
    this.expensesExtractService
      .extractExpensesFromImage(this.selectedFile, this.categories())
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (expenses) => {
          console.log('Expenses extracted:', expenses);
          this.extractedExpenses = expenses;
          expenses.forEach((expense) => {
            this.addExpense(
              expense,
              this.daysFunctions.convertDateToString(
                this.getDayDate(this.offset!)
              )
            );
          });
        },
        error: (error) => {
          console.error('Error extracting expenses:', error);
        },
      });
  }

  //DAYS ----------------------------------------------------------

  daysFunctions = inject(DaysFunctionsService);
  currentWeekInterval!: { startDate: Date; endDate: Date };
  selectedDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // default ziua curentă selectată (luni = 0)
  offset?: number;

  getDayDate(offset: number): Date {
    const date = new Date(this.currentWeekInterval.startDate);
    date.setDate(date.getDate() + offset);
    return date;
  }

  isCurrentWeek(): boolean {
    return !this.daysFunctions.isDateBeforeToday(
      this.daysFunctions.convertDateToString(this.currentWeekInterval.endDate)
    );
  }

  goToPreviousWeek(): void {
    const previousWeekDate = new Date(this.currentWeekInterval.startDate);
    previousWeekDate.setDate(previousWeekDate.getDate() - 7);

    const dateString = this.daysFunctions.convertDateToString(previousWeekDate);
    this.currentWeekInterval = this.daysFunctions.getWeekInterval(dateString);

    // Resetează ziua selectată pe prima zi (luni)
    this.selectedDayIndex = 0;
    this.loadExpenses(
      this.daysFunctions.convertDateToString(this.currentWeekInterval.startDate)
    );
  }

  goToNextWeek(): void {
    const nextWeekDate = new Date(this.currentWeekInterval.startDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);

    const dateString = this.daysFunctions.convertDateToString(nextWeekDate);
    this.currentWeekInterval = this.daysFunctions.getWeekInterval(dateString);

    // Resetează ziua selectată pe prima zi (luni)
    this.selectedDayIndex = 0;
    this.loadExpenses(
      this.daysFunctions.convertDateToString(this.currentWeekInterval.startDate)
    );
  }

  //Services---------------------------------------------------------
  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private confirmDialogService: ConfirmDialogService,
    private spinnerService: SpinnerService,
    private notificationService: NotificationService
  ) {}

  //AICIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII

  async ngOnInit() {
    const today = new Date();
    this.currentWeekInterval = this.daysFunctions.getWeekInterval(
      this.daysFunctions.convertDateToString(today)
    );

    this.loadCategories();
    this.loadExpenses(this.daysFunctions.convertDateToString(today));

    /////////////////////////////
    // this.spinnerService.showSpinner();
    // this.loadTodayExpenses();
    // this.loadWeekDays();
    // // this.loadExpensesForWeek(this.week);
    // const { startDate, endDate } = this.getWeekInterval(
    //   new Date().toISOString().split('T')[0]
    // );
    // this.currentWeekStart = startDate.toISOString().split('T')[0];
    // this.currentWeekEnd = endDate.toISOString().split('T')[0];

    // this.categories = this.trackerCategoriesService.categories;
    // this.budgetService
    //   .getBudgetForUserByDate(this.authService.getId()!, this.currentWeekEnd)
    //   .subscribe((resp) => {
    //     //here goes implementation
    //     console.log('aici:', resp);
    //     if (resp == null || resp == undefined) {
    //       const newBudget: WeeklyBudget = {
    //         weeklyBudget: 0,
    //         currentSpending: this.getWeeklyTotal(),
    //         startDate: this.currentWeekEnd,
    //         userId: this.authService.getId()!,
    //       };

    //       this.popoutService.showPopup(newBudget);
    //     }
    //   });
  }

  //------------------------------------------------------------------

  //Excel-------------------------------------------------------------

  private expensesExportService = inject(ExpensesExportService);

  exportWeeklyData(): void {
    this.expensesExportService.exportToExcel(this.weeklySpending);
  }

  //------------------------------------------------------------------

  //------------------------------------------------------------------

  //AI Analysis

  private expensesAnalysisService = inject(ExpensesAnalysisService);
  weeklyAnalysis = this.expensesAnalysisService.weeklyAnalysis;

  sendWeeklyExpensesToGemini(): void {
    this.expensesAnalysisService.sendWeeklyExpensesToGemini(
      this.weeklySpending
    );
  }

  //------------------------------------------------------------------

  //CRUD EXPENSES------------------------------------------------------

  //CREATE

  private createNewItem() {
    const newExpense: Expense = {
      name: this.expenseName,
      amount: this.expenseAmount!,
      category: this.selectedCategory,
    };
    return newExpense;
  }

  private resetSavingForm() {
    this.resetForm();
    this.showExpenseForm = false;
  }

  addExpenseFromForm(day: string): void {
    if (!this.selectedCategory || !this.expenseName || !this.expenseAmount) {
      this.notificationService.showNotification(
        'Please fill out all fields.',
        'warning'
      );
      return;
    }

    const newExpense = this.createNewItem();
    this.resetSavingForm();
    this.addExpense(newExpense, day);
  }

  //UPDATE

  private updateModeForm(expense: Expense) {
    if (!expense) return;

    this.isEditing = true;
    this.showExpenseForm = true;
    this.isSaveDisabled = true;
  }

  private showDataForUpdateMode(expense: Expense) {
    this.expenseName = expense.name;
    this.selectedCategory = expense.category;
    this.expenseAmount = expense.amount;
    this.editingExpenseId = expense.id!;
  }

  turnOnUpdateMode(expense: Expense) {
    this.updateModeForm(expense);
    this.showDataForUpdateMode(expense);
  }

  private updatedItem() {
    const updatedItem = this.createNewItem();
    updatedItem.id = this.editingExpenseId!;
    return updatedItem;
  }

  //DELETE

  private verifyDeletion() {
    return this.confirmDialogService.confirm({
      message: 'Are you sure you want to delete?',
    });
  }

  deleteExpense2(expense: Expense): void {
    this.verifyDeletion().subscribe(() => {
      this.delete('2025-03-10', expense.id!);
      this.notificationService.showNotification(
        'Expense deleted successfully!',
        'success'
      );
    });
  }

  validateAmount(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // this.errorMessage = '';

    if (!value) {
      this.isSaveDisabled = true;
      return;
    }

    const numValue = parseFloat(value);

    if (numValue <= 0) {
      // this.errorMessage = 'Amount must be greater than 0';
      this.isSaveDisabled = true;
      this.notificationService.showNotification(
        'Amount must be greater than 0',
        'warning'
      );
      return;
    }

    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length > 2) {
        input.value = numValue.toFixed(2);
        this.notificationService.showNotification(
          'Only two decimal places allowed.',
          'warning'
        );
      }
    }
    this.isSaveDisabled = false;
  }

  validateFormAtSave() {
    const isValid =
      this.selectedCategory &&
      this.expenseName.trim() !== '' &&
      this.expenseAmount &&
      this.expenseAmount > 0;

    this.isSaveDisabled = !isValid;

    if (!isValid) {
      this.notificationService.showNotification(
        'Please fill out all fields correctly.',
        'warning'
      );
    }
  }

  validateFormAtUpdate() {
    this.isSaveDisabled = false;
  }

  resetForm() {
    this.expenseName = '';
    this.selectedCategory = '';
    this.expenseAmount = null;
    this.isEditing = false;
    this.editingExpenseId = null;
  }

  errorMessage: string = '';
  selectedCategory: string = '';
  isSaveDisabled: boolean = true;
  expenseName: string = '';
  expenseAmount: number | null = null;

  showCategoryPopup = false;
  showExpenseForm = false;
  showWeeklyOverview = false;
  showAnalysisOverview = false;
  showAIExpertiseOverview = false;
  isEditing = false;
  editingExpenseId: string | null = null;

  expendedDay: { date: string; dayName: string } | null = null;
  // expendedDayExpenses: Expense2[] = [];

  newCategory = '';

  editingCategory: string | undefined = undefined;
  editedCategory: string = '';

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

  weeklyExpenses: ExpenseWithDate[] = [];
  weeklySpending: DaySpending[] = [];

  async toggleWeeklyOverview() {
    this.showWeeklyOverview = !this.showWeeklyOverview;
    this.showExpenseForm = false;
    this.showAnalysisOverview = false;

    if (this.showWeeklyOverview) {
      const todayString = this.daysFunctions.convertDateToString(new Date());
      const { startDate, endDate } =
        this.daysFunctions.getWeekInterval(todayString);

      this.weeklyExpenses =
        await this.trackerExpensesService.loadUserExpensesByInterval(
          startDate,
          endDate
        );

      this.populateWeeklySpending(startDate);
      this.populateCategoryTotals();
    }
  }

  populateWeeklySpending(startDate: Date): void {
    this.weeklySpending = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const dateString = this.daysFunctions.convertDateToString(currentDate);
      const dayName = this.daysFunctions.getDayName(dateString);

      const dayExpenses = this.weeklyExpenses.filter(
        (expense) => expense.date === dateString
      );

      const total = dayExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      this.weeklySpending.push({
        dayName,
        dateString,
        total,
        expenses: dayExpenses,
        isExpanded: false,
      });
    }

    console.log('Weekly spending by day:', this.weeklySpending);
  }

  toggleDayExpenses(day: any): void {
    day.isExpanded = !day.isExpanded;
  }

  toggleAnalysisOverview() {
    this.showAnalysisOverview = !this.showAnalysisOverview;
    this.showExpenseForm = false;
    this.showWeeklyOverview = false;
  }

  toggleAIExpertiseOverview() {
    this.showAIExpertiseOverview = !this.showAIExpertiseOverview;
    this.showAnalysisOverview = !this.showAnalysisOverview;
    this.sendWeeklyExpensesToGemini();
  }

  //pie
  categoryTotals: { category: string; total: number }[] = [];

  populateCategoryTotals(): void {
    const totalsByCategory: { [key: string]: number } = {};

    for (const expense of this.weeklyExpenses) {
      const category = expense.category;

      if (!totalsByCategory[category]) {
        totalsByCategory[category] = 0;
      }

      totalsByCategory[category] += expense.amount;
    }

    this.categoryTotals = Object.entries(totalsByCategory).map(
      ([category, total]) => ({
        category,
        total,
      })
    );

    console.log('Category totals:', this.categoryTotals);
  }
}
