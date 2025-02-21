import { Component, OnInit } from '@angular/core';
import { TrackerConfigService, TrackerConfig } from '../../services/tracker-config.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.css']
})
export class TrackerComponent implements OnInit {
  days: string[] = [];
  selectedDay = '';
  categories: string[] = [];
  newCategory = '';
  showCategoryPopup = false;

  constructor(private trackerConfigService: TrackerConfigService) { }

  ngOnInit() {
    this.trackerConfigService.getWeekdays().subscribe((config: TrackerConfig) => {
      this.days = config.weekdays.map(day => day.name);
      this.selectedDay = this.days.length > 0 ? this.days[0] : '';
    });
  }

  toggleCategoryPopup() {
    this.showCategoryPopup = !this.showCategoryPopup;
    this.newCategory = '';
  }

  addCategory() {
    if (this.newCategory.trim() && !this.categories.includes(this.newCategory.trim())) {
      this.categories.unshift(this.newCategory.trim());
    }
    this.showCategoryPopup = false;
    this.newCategory = '';
  }


  // Dummy expense data and functions

  showWeeklyOverview = false;

  expenses = [
    { day: 'Monday', amount: 20 },
    { day: 'Monday', amount: 15 },
    { day: 'Tuesday', amount: 30 },
    { day: 'Wednesday', amount: 25 },
    { day: 'Wednesday', amount: 10 },
    { day: 'Thursday', amount: 40 }
  ];

  toggleWeeklyOverview(): void {
    this.showWeeklyOverview = !this.showWeeklyOverview;
  }

  getTotalWeeklyExpenses(): number {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  getTotalForDay(day: string): number {
    return this.expenses
      .filter(expense => expense.day === day)
      .reduce((total, expense) => total + expense.amount, 0);
  }
}
