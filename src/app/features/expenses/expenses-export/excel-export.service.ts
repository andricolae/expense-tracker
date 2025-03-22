import { Injectable, inject } from '@angular/core';
import { ExcelService } from '../../../core/excel/excel.service';
import { DayExpense } from '../models/spending.model';

@Injectable({
  providedIn: 'root',
})
export class ExpensesExportService {
  private excelService = inject(ExcelService);

  exportToExcel(spendings: DayExpense[]): void {
    const dataForExcel = spendings.flatMap((day) =>
      day.expenses.map((expense) => ({
        Date: day.dateString,
        Day: day.dayName,
        Name: expense.name,
        Category: expense.category,
        Amount: expense.amount,
      }))
    );

    this.excelService.exportToExcel(
      dataForExcel,
      'Weekly_Expenses',
      'Expenses'
    );
  }
}
