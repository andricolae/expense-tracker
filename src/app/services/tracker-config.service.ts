import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Weekday {
  name: string;
}

export interface TrackerConfig {
  weekdays: Weekday[];
}

@Injectable({
  providedIn: 'root',
})
export class TrackerConfigService {
  private configUrl = 'tracker-config.json';

  constructor(private http: HttpClient) {}

  getWeekdays(): Observable<TrackerConfig> {
    return this.http.get<TrackerConfig>(this.configUrl);
  }
}
