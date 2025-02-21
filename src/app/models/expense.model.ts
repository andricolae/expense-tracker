export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Expense {
  id?: string;
  name: string;
  category: string;
  amount: number;
}

export type CreateExpenseDTO = Omit<Expense, 'id'>;

export type UpdateExpenseDTO = Partial<CreateExpenseDTO>;

export interface FirestoreExpenseDoc {
  name: string;
  category: string;
  amount: number;
}
