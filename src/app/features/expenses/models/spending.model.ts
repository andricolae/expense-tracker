export interface Expense {
  id?: string;
  name: string;
  amount: number;
  category: string;
}

export interface DaySpending {
  date: string;
  dayName: string;
  expenses: Expense[];
  total: number;
  isExpanded?: boolean;
}

export interface WeeklySpendings {
  date: string;
  spendings: Expense[];
}
