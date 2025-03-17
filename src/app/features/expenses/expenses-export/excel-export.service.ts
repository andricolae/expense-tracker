import { inject, Injectable } from '@angular/core';
import { DaySpending } from '../models/spending.model';
import { ExcelService } from '../../../core/excel/excel.service';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  private excelService = inject(ExcelService);

  exportToExcel(spendings: DaySpending[]): void {
    const dataForExcel = spendings.flatMap((day) =>
      day.expenses.map((expense) => ({
        Date: day.date,
        Day: day.dayName,
        Name: expense.name,
        Category: expense.category,
        Amount: expense.amount,
      }))
    );

    this.excelService.generateExcel(dataForExcel, 'Weekly_Expenses');
  }
}
