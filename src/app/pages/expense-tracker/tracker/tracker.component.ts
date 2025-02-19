import { NgFor } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tracker',
  imports: [NgFor],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.css'
})
export class TrackerComponent {
  days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  selectedDay = "MON";
}
