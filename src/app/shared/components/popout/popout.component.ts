// import { CommonModule } from '@angular/common';
// import { Component, inject, signal } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { PopoutService } from './popout.service';
// import { WeeklyBudget } from '../../services/weekly-budget.service';

// @Component({
//   selector: 'app-popout',
//   imports: [FormsModule, CommonModule],
//   templateUrl: './popout.component.html',
//   styleUrl: './popout.component.css',
// })
// export class PopoutComponent {
//   private popoutService = inject(PopoutService);

//   isVisible = this.popoutService.isVisible;
//   inputValue = '';

//   budget = this.popoutService.budget;

//   showPopup() {}

//   hidePopup(): void {
//     this.popoutService.hidePopup();
//   }

//   submitValue(): void {
//     console.log('Valoarea introdusă:', this.inputValue);

//     const newBudget = this.budget();
//     newBudget!.weeklyBudget = Number(this.inputValue);
//     this.budget.set(newBudget);

//     this.popoutService.submitValue(this.budget()!);
//   }
// }
