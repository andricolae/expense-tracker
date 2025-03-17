// import { inject, Injectable, signal } from '@angular/core';
// import {
//   WeeklyBudget,
//   WeeklyBudgetService,
// } from '../../services/weekly-budget.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class PopoutService {
//   isVisible = signal<boolean>(false);
//   inputValue = signal<string>('');

//   budget = signal<WeeklyBudget | undefined>(undefined);
//   private budgetService = inject(WeeklyBudgetService);

//   showPopup(input: WeeklyBudget): void {
//     this.isVisible.set(true);
//     this.budget.set(input);
//   }

//   hidePopup(): void {
//     this.isVisible.set(false);
//   }

//   submitValue(budget: WeeklyBudget): void {
//     console.log('Serviciu', budget.weeklyBudget);
//     this.budgetService.addWeeklyBudget(budget).subscribe((response) => {
//       console.log(response);
//     });
//     this.hidePopup(); // Închide pop-up-ul după submit
//   }
// }
