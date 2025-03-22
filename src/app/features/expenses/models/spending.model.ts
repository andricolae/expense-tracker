export interface Expense {
  id?: string;
  name: string;
  amount: number;
  category: string;
}

export interface DayExpense {
  dayName: string;
  dateString: string;
  total: number;
  expenses: Expense[];
  isExpanded: boolean;
}

export interface ExpenseWithDate extends Expense {
  date: string;
}

export interface DaySpending {
  dayName: string;
  dateString: string;
  total: number;
  expenses: ExpenseWithDate[];
  isExpanded: boolean;
}

export interface WeeklySpendings {
  date: string;
  spendings: Expense[];
}
