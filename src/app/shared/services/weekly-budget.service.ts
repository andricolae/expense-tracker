// import { Injectable } from '@angular/core';
// import {
//   Database,
//   ref,
//   set,
//   get,
//   push,
//   update,
//   remove,
// } from '@angular/fire/database';
// import { from, map, Observable } from 'rxjs';

// export interface WeeklyBudget {
//   id?: string;
//   weeklyBudget: number;
//   currentSpending: number;
//   startDate: string; // Data de început a săptămânii (ex: "2025-03-11")
//   userId: string;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class WeeklyBudgetService {
//   private basePath = 'weeklyBudgets/';

//   constructor(private db: Database) {}

//   // Create a new weekly budget
//   addWeeklyBudget(budget: WeeklyBudget): Observable<void> {
//     const budgetRef = push(ref(this.db, this.basePath));
//     const budgetWithId = { ...budget, id: budgetRef.key };
//     return from(set(budgetRef, budgetWithId));
//   }

//   // Read all weekly budgets for a specific user
//   getWeeklyBudgetsForUser(userId: string): Observable<WeeklyBudget[]> {
//     const budgetsRef = ref(this.db, this.basePath);
//     return from(get(budgetsRef)).pipe(
//       map((snapshot) => {
//         if (snapshot.exists()) {
//           const data = snapshot.val();
//           const budgets = Object.values(data) as WeeklyBudget[];
//           return budgets.filter((budget) => budget.userId === userId);
//         } else {
//           return [];
//         }
//       })
//     );
//   }

//   // Read budget for a specific user and a specific start date
//   getBudgetForUserByDate(
//     userId: string,
//     startDate: string
//   ): Observable<WeeklyBudget | null> {
//     const budgetsRef = ref(this.db, this.basePath);
//     return from(get(budgetsRef)).pipe(
//       map((snapshot) => {
//         if (!snapshot.exists()) {
//           return null;
//         }

//         const data = snapshot.val();
//         const budgets = Object.values(data) as WeeklyBudget[];
//         return (
//           budgets.find(
//             (budget) =>
//               budget.userId === userId && budget.startDate === startDate
//           ) || null
//         );
//       })
//     );
//   }

//   // Update an existing weekly budget
//   updateWeeklyBudget(budget: WeeklyBudget): Observable<void> {
//     if (!budget.id) {
//       throw new Error('Budget must have an id');
//     }
//     const budgetRef = ref(this.db, `${this.basePath}${budget.id}`);
//     return from(update(budgetRef, budget));
//   }

//   // Delete a weekly budget by ID
//   deleteWeeklyBudget(budgetId: string): Observable<void> {
//     const budgetRef = ref(this.db, `${this.basePath}${budgetId}`);
//     return from(remove(budgetRef));
//   }
// }
