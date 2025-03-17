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
import { Expense } from '../../features/expenses/models/spending.model';
import { TrackerExpensesService } from './services/tracker-expenses.service';
import { NotificationComponent } from '../../shared/components/notification/notification.component';

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

  editCategory(category: { id: string; name: string }) {}

  saveEditedCategory(categoryId: string) {}

  //EXPENSES V2

  private trackerExpensesService = inject(TrackerExpensesService);
  expenses = this.trackerExpensesService.expenses;

  loadExpenses(date: string) {
    this.trackerExpensesService.loadUserExpensesByDate(date);
  }

  addExpense(newExpense: Expense) {
    this.trackerExpensesService.addExpense('2025-03-10', newExpense);
  }

  updateExpense(): void {
    const updatedExpense = this.updatedItem();
    this.resetSavingForm();
    this.trackerExpensesService.editExpense(
      '2025-03-10',
      updatedExpense.id!,
      updatedExpense
    );
  }

  private delete(day: string, idExpense: string) {
    this.trackerExpensesService.deleteExpense(day, idExpense);
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

  ngOnInit() {
    this.loadCategories();
    this.loadExpenses('2025-03-10');

    /////////////////////////////
    // this.spinnerService.showSpinner();
    // this.loadTodayExpenses();
    this.loadWeekDays();
    // this.loadExpensesForWeek(this.week);
    const { startDate, endDate } = this.getWeekInterval(
      new Date().toISOString().split('T')[0]
    );
    this.currentWeekStart = startDate.toISOString().split('T')[0];
    this.currentWeekEnd = endDate.toISOString().split('T')[0];

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

  exportToExcel(): void {}

  //------------------------------------------------------------------

  //Extracting from photo----------------------------------------------------------

  imageUrl: string | ArrayBuffer | null = null;
  extractedText: string = '';
  selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];

      const reader = new FileReader();
      reader.onload = (e) => (this.imageUrl = e.target!.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  processImage(): void {}

  //------------------------------------------------------------------

  //AI Analysis

  private expensesAnalysisService = inject(ExpensesAnalysisService);
  weeklyAnalysis = this.expensesAnalysisService.weeklyAnalysis;

  sendWeeklyExpensesToGemini(): void {
    // this.expensesAnalysisService.sendWeeklyExpensesToGemini(
    //   this.weeklySpending
    // );
  }

  //------------------------------------------------------------------

  //UI Expenses--------------------------------------------------------

  selectedDay: { date: string; dayName: string } | undefined = undefined;

  week: { date: string; dayName: string }[] = [];

  // 1️⃣ Funcție existentă: intervalul complet al săptămânii pe baza unei date
  getWeekInterval(dateString: string): { startDate: Date; endDate: Date } {
    const date = new Date(dateString);

    const dayOfWeek = date.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // dacă e duminică, ne întoarcem 6 zile
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek; // până la final de săptămână

    const monday = new Date(date);
    monday.setDate(date.getDate() - daysToMonday);

    const sunday = new Date(date);
    sunday.setDate(date.getDate() + daysToSunday);

    return { startDate: monday, endDate: sunday };
  }

  // 2️⃣ Funcție nouă: vector cu 7 zile - nume + dată (Luni-Duminică)
  getCurrentWeekWithDays(
    startDate: string = new Date().toISOString().split('T')[0]
  ): { date: string; dayName: string }[] {
    const date = new Date(startDate);

    // Get the first day of the week (Monday)
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    if (dayOfWeek === 0) {
      // If today is Sunday, move back 6 days to Monday
      monday.setDate(date.getDate() - 6);
    } else {
      // Otherwise, move back (dayOfWeek - 1) days
      monday.setDate(date.getDate() - (dayOfWeek - 1));
    }

    // Generate the week (Monday - Sunday)
    const week: { date: string; dayName: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);

      week.push({
        date: currentDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        dayName: this.getDayOfWeek(currentDate.toISOString().split('T')[0]),
      });
    }

    return week;
  }

  // Helper: ziua săptămânii pentru o dată dată (folosită și în ambele metode)
  private getDayOfWeek(dateString: string): string {
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const date = new Date(dateString);
    return daysOfWeek[date.getDay()];
  }

  isDateInFutureOrPast(dateString: string): boolean {
    const today = new Date();
    const inputDate = new Date(dateString);
    return inputDate > today; // true = viitor, false = trecut sau azi
  }

  findDayByDate(date: string): { date: string; dayName: string } | undefined {
    return this.week.find((day) => day.date === date);
  }

  //BOASSSSSSSSSS
  loadWeekDays(startDate: string = new Date().toISOString().split('T')[0]) {
    this.displayedWeekStart = startDate;
    this.week = this.getCurrentWeekWithDays(startDate);
    this.selectedDay = this.findDayByDate(startDate);
    // this.expenses2 = [];
    // this.loadExpensesForWeek(this.week); // Load expenses for the selected week
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

  addExpenseFromForm(): void {
    if (!this.selectedCategory || !this.expenseName || !this.expenseAmount) {
      this.notificationService.showNotification(
        'Please fill out all fields.',
        'warning'
      );
      return;
    }

    const newExpense = this.createNewItem();
    this.resetSavingForm();
    this.addExpense(newExpense);
  }

  //READ

  // weeklySpending: DaySpending[] = [];

  urBudget = -1;
  getWeeklyTotal(): number {
    // this.budgetService
    //   .getBudgetForUserByDate(this.authService.getId()!, this.currentWeekEnd)
    //   .subscribe((resp) => {
    //     if (resp != undefined && resp != null) {
    //       this.urBudget = resp!.weeklyBudget;
    //     }
    //   });
    // return this.weeklySpending.reduce((sum, day) => sum + day.total, 0);
    return 0;
  }

  getWeeklyCategoryTotals(): { category: string; total: number }[] {
    const categoryMap = new Map<string, number>();

    // for (const day of this.weeklySpending) {
    //   for (const expense of day.expenses) {
    //     const currentAmount = categoryMap.get(expense.category) || 0;
    //     categoryMap.set(expense.category, currentAmount + expense.amount);
    //   }
    // }

    return Array.from(categoryMap.entries()).map(([category, total]) => ({
      category,
      total,
    }));
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

  //--------------------------------------------------------------------

  //UI -----------------------------------------------------------------

  onKeyPress(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;
    const inputValue = (event.target as HTMLInputElement).value;

    if (
      [46, 8, 9, 27, 13].indexOf(charCode) !== -1 ||
      (charCode === 65 && event.ctrlKey === true) ||
      (charCode === 67 && event.ctrlKey === true) ||
      (charCode === 86 && event.ctrlKey === true) ||
      (charCode === 88 && event.ctrlKey === true)
    ) {
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

  toggleWeeklyOverview() {
    this.showWeeklyOverview = !this.showWeeklyOverview;
    this.showExpenseForm = false;
    this.showAnalysisOverview = false;
    // this.loadExpensesForWeek(this.week);
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

  async toggleDayExpenses() {
    // day.isExpanded = !day.isExpanded;
    // if (day.isExpanded && (!day.expenses || day.expenses.length === 0)) {
    //   this.expensesCrudService
    //     .loadExpensesForUserOnDate(this.authService.getId()!, day.date)
    //     .subscribe((expenses) => {
    //       day.expenses = expenses;
    //       this.cdr.detectChanges();
    //     });
    // }
    // this.cdr.detectChanges();
  }

  displayedWeekStart: string = new Date().toISOString().split('T')[0]; // Track the start of the current displayed week

  currentWeekStart: string = ''; // Start date of the current week
  currentWeekEnd: string = ''; // End date of the current week

  goToPreviousWeek() {
    const firstDayOfWeek = new Date(this.displayedWeekStart);
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - 7); // Move back a week

    this.displayedWeekStart = firstDayOfWeek.toISOString().split('T')[0];

    // this.expenses2 = []; //clear expenses

    this.loadWeekDays(this.displayedWeekStart);
  }

  goToNextWeek() {
    if (this.isCurrentWeek()) return; // Prevent moving past the current week

    const firstDayOfWeek = new Date(this.displayedWeekStart);
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() + 7); // Move forward a week

    this.displayedWeekStart = firstDayOfWeek.toISOString().split('T')[0];

    // this.expenses2 = []; //clear expenses

    this.loadWeekDays(this.displayedWeekStart);
  }

  isCurrentWeek(): boolean {
    return this.week[0].date === this.currentWeekStart;
  }

  getFormattedWeekRange(): string {
    const { startDate, endDate } = this.getWeekInterval(
      this.displayedWeekStart
    );

    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const monthAbbr = date.toLocaleString('en-US', { month: 'short' });
      return `${day}.${monthAbbr}`;
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
}
