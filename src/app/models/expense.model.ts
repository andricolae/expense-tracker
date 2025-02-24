export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type Category = 'groceries' | 'taxes' | 'entertainment' | 'education' | 'clothing' | 'healthcare' | 'sports' | 'travel' | 'gifts' | 'miscellaneous';

export interface Expense {
  id?: string;
  name: string;
  category: Category;
  amount: number;
}

export type CreateExpenseDTO = Omit<Expense, 'id'>;

export type UpdateExpenseDTO = Partial<CreateExpenseDTO>;

export interface FirestoreExpenseDoc {
  name: string;
  category: Category;
  amount: number;
}
