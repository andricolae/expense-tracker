import { Component } from '@angular/core';
import { CrudService } from '../../services/crud.service';

@Component({
  selector: 'app-crud',
  imports: [],
  templateUrl: './crud.component.html',
  styleUrl: './crud.component.css'
})
export class CrudComponent {
  constructor(private crudService: CrudService) {}

  ngOnInit() {
    console.log(this.loadCategoryExpenses("clothes"));
  }

  async loadDailyExpenses(day: string) {
    return await this.crudService.getByDay(day);
  }

  async loadDailyExpensesByCategory(day: string, category: string) {
    return await this.crudService.getByDayAndCategory(day, category);
  }

  async loadCategoryExpenses(category: string) {
    return await this.crudService.getByCategoryAllDays(category);
  }
}
