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

  ngOnInit(){
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

}
