import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import {
  TrackerConfigService,
  TrackerConfig,
} from '../../services/tracker-config.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud.service';
import {
  CreateExpenseDTO,
  DayOfWeek,
  Expense,
  UpdateExpenseDTO,
  Category,
} from '../../models/expense.model';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { PieComponent } from '../../components/pie/pie.component';
import { ExcelService } from '../../services/excel.service';
import { GeminiService } from '../../services/gemini.service';
import { OcrService } from '../../services/ocr.service';
import { ChatbotComponent } from '../../components/chatbot/chatbot.component';
import { ExpensesCrudService } from '../../services/expenses-crud.service';
import { Expense2 } from '../../services/expenses-crud.service';
import { AuthService } from '../../services/auth.service';

interface DaySpending {
  date: string;
  dayName: string;
  expenses: Expense2[];
  total: number;
}

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, PieComponent, ChatbotComponent],
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.css'],
})
export class TrackerComponent implements OnInit {
  //Services---------------------------------------------------------
  constructor(
    private authService: AuthService,
    private trackerConfigService: TrackerConfigService,
    private crudService: CrudService,
    private cdr: ChangeDetectorRef,
    private confirmDialogService: ConfirmDialogService,
    private excelService: ExcelService,
    private ocrService: OcrService,
    private geminiService: GeminiService,
    private expensesCrudService: ExpensesCrudService
  ) {}

  ngOnInit() {
    this.loadTodayExpenses();
    this.loadWeekDays();
    this.loadExpensesForWeek(this.week);
  }

  //------------------------------------------------------------------

  //Excel-------------------------------------------------------------

  data = [
    { Name: 'John Doe', Age: 30, City: 'New York' },
    { Name: 'Jane Smith', Age: 25, City: 'San Francisco' },
    // Add more data as needed
  ];

  exportToExcel(): void {
    this.excelService.generateExcel(this.data, 'user_data');
  }

  //------------------------------------------------------------------

  //Extracting from photo----------------------------------------------------------

  imageUrl: string | ArrayBuffer | null = null;
  extractedText: string = '';
  extractedExpenses: Expense[] = [];
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

  processImage(): void {
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = (reader.result as string).split(',')[1];
      this.ocrService.extractText(base64Image).subscribe((response) => {
        if (response.responses && response.responses.length > 0) {
          this.extractedText =
            response.responses[0].fullTextAnnotation?.text || '';
          this.sendToGemini(this.extractedText);
        }
      });
    };
    reader.readAsDataURL(this.selectedFile);
  }

  sendToGemini(ocrText: string) {
    this.geminiService.extractExpenses(ocrText).subscribe(async (response) => {
      try {
        const rawText = response.candidates[0].content.parts[0].text;

        // Curățăm delimitatorii de bloc de cod
        const cleanedText = rawText
          .replace(/^```json\s*/, '')
          .replace(/```$/, '');

        // Parsăm JSON-ul curățat
        this.extractedExpenses = JSON.parse(cleanedText);
        console.log(this.extractedExpenses);

        this.addExpensesFromExtractedText(this.extractedExpenses);
        // this.getExpensesByDay(this.selectedDay);
      } catch (error) {
        console.error('Eroare la parsarea răspunsului Gemini:', error);
        this.extractedExpenses = []; // Evităm afișarea de date corupte în UI
      }
    });
  }

  addExpensesFromExtractedText(expenses: Expense[]) {
    expenses.forEach((expense) => {
      // this.crudService.addItem(this.selectedDay, expense);
    });
  }

  //------------------------------------------------------------------

  //UI Expenses--------------------------------------------------------

  categories: Category[] = [
    'Groceries',
    'Taxes',
    'Entertainment',
    'Education',
    'Clothing',
    'Healthcare',
    'Sports',
    'Travel',
    'Gifts',
    'Miscellaneous',
  ];

  days: DayOfWeek[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

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
  getCurrentWeekWithDays(): { date: string; dayName: string }[] {
    const today = new Date();

    // Aflăm care e prima zi din săptămână (Luni)
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    if (dayOfWeek === 0) {
      // dacă azi e duminică, ne întoarcem 6 zile înapoi
      monday.setDate(today.getDate() - 6);
    } else {
      // altfel, ne întoarcem cu (dayOfWeek - 1)
      monday.setDate(today.getDate() - (dayOfWeek - 1));
    }

    // Construim array-ul cu 7 zile (Luni -> Duminică)
    const week: { date: string; dayName: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);

      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayName = this.getDayOfWeek(dateStr);

      week.push({ date: dateStr, dayName });
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
    today.setHours(0, 0, 0, 0); // curățăm ora ca să comparăm doar datele calendaristice

    const inputDate = new Date(dateString);
    inputDate.setHours(0, 0, 0, 0); // și input-ul curățat de oră

    return inputDate > today; // true = viitor, false = trecut sau azi
  }

  findDayByDate(date: string): { date: string; dayName: string } | undefined {
    return this.week.find((day) => day.date === date);
  }

  loadWeekDays() {
    this.week = this.getCurrentWeekWithDays();
    this.selectedDay = this.findDayByDate(
      new Date().toISOString().split('T')[0]
    );
  }

  //------------------------------------------------------------------

  //CRUD EXPENSES------------------------------------------------------

  expenses2: Expense2[] = [];

  //CREATE

  private createNewItem() {
    const newExpense: Expense2 = {
      name: this.expenseName,
      amount: this.expenseAmount!,
      date: this.selectedDay!.date,
      category: this.selectedCategory,
      userId: this.authService.getId()!,
    };
    return newExpense;
  }

  private resetSavingForm() {
    this.resetForm();
    this.showExpenseForm = false;
  }

  addExpense(): void {
    const newExpense = this.createNewItem();
    this.resetSavingForm();
    this.expensesCrudService.addExpense(newExpense).subscribe((response) => {
      this.loadExpensesForUserOnDate(this.selectedDay!.date);
    });
  }

  //READ

  loadTodayExpenses() {
    this.loadExpensesForUserOnDate(new Date().toISOString().split('T')[0]);
  }

  loadExpenses(): void {
    this.expensesCrudService
      .getExpensesForUser(this.authService.getId()!)
      .subscribe((expenses) => {
        this.expenses2 = expenses;
      });
  }

  loadExpensesForUserOnDate(date: string) {
    this.expensesCrudService
      .loadExpensesForUserOnDate(this.authService.getId()!, date)
      .subscribe((expenses) => {
        this.expenses2 = expenses;
      });
  }

  weeklySpending: DaySpending[] = [];

  loadExpensesForWeek(week: { date: string; dayName: string }[]): void {
    this.expensesCrudService
      .getExpensesForUser(this.authService.getId()!)
      .subscribe((expenses) => {
        this.weeklySpending = week.map((day) => {
          const expensesForDay = expenses.filter(
            (exp) => exp.date === day.date
          );
          const total = expensesForDay.reduce(
            (sum, exp) => sum + exp.amount,
            0
          );

          return {
            date: day.date,
            dayName: day.dayName,
            expenses: expensesForDay,
            total: total,
          };
        });
      });
  }

  getWeeklyTotal(): number {
    return this.weeklySpending.reduce((sum, day) => sum + day.total, 0);
  }

  getWeeklyCategoryTotals(): { category: string; total: number }[] {
    const categoryMap = new Map<string, number>();

    for (const day of this.weeklySpending) {
      for (const expense of day.expenses) {
        const currentAmount = categoryMap.get(expense.category) || 0;
        categoryMap.set(expense.category, currentAmount + expense.amount);
      }
    }

    return Array.from(categoryMap.entries()).map(([category, total]) => ({
      category,
      total,
    }));
  }

  //UPDATE

  private updateModeForm(expense: Expense2) {
    if (!expense) return;

    this.isEditing = true;
    this.showExpenseForm = true;
    this.isSaveDisabled = true;
  }

  private showDataForUpdateMode(expense: Expense2) {
    this.expenseName = expense.name;
    this.selectedCategory = expense.category;
    this.expenseAmount = expense.amount;
    this.editingExpenseId = expense.id!;
  }

  turnOnUpdateMode(expense: Expense2) {
    this.updateModeForm(expense);
    this.showDataForUpdateMode(expense);
  }

  private updatedItem() {
    const updatedItem = this.createNewItem();
    updatedItem.id = this.editingExpenseId!;
    return updatedItem;
  }

  updateExpense2(): void {
    const updatedExpense = this.updatedItem();
    this.resetSavingForm();
    this.expensesCrudService.updateExpense(updatedExpense).subscribe(() => {
      this.loadExpensesForUserOnDate(this.selectedDay!.date);
    });
  }

  //DELETE

  private verifyDeletion() {
    return this.confirmDialogService.confirm({
      message: 'Are you sure you want to delete this expense?',
    });
  }

  private delete(expense: Expense2) {
    if (expense.id) {
      this.expensesCrudService.deleteExpense(expense.id).subscribe(() => {
        this.loadExpensesForUserOnDate(this.selectedDay!.date);
      });
    }
  }

  deleteExpense2(expense: Expense2): void {
    this.verifyDeletion().subscribe(() => {
      this.delete(expense);
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

  validateFormAtSave() {
    this.isSaveDisabled =
      !this.selectedCategory ||
      !this.expenseName ||
      !this.expenseAmount ||
      this.expenseAmount <= 0;
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
  expendedDayExpenses: Expense2[] = [];

  toggleCategoryPopup() {
    this.showCategoryPopup = !this.showCategoryPopup;
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
    this.loadExpensesForWeek(this.week);
  }

  toggleAnalysisOverview() {
    this.showAnalysisOverview = !this.showAnalysisOverview;
    this.showExpenseForm = false;
    this.showWeeklyOverview = false;
  }

  toggleAIExpertiseOverview() {
    this.showAIExpertiseOverview = !this.showAIExpertiseOverview;
    this.showAnalysisOverview = !this.showAnalysisOverview;
  }

  async toggleDayExpenses(day: { date: string; dayName: string }) {
    if (this.expendedDay === day) {
      this.expendedDay = null;
      this.expendedDayExpenses = [];
    } else {
      this.expendedDay = day;
      this.expensesCrudService
        .loadExpensesForUserOnDate(this.authService.getId()!, day.date)
        .subscribe((expenses) => {
          this.expendedDayExpenses = expenses;
        });
      this.cdr.detectChanges();
    }
  }
}
