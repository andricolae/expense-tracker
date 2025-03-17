import { Injectable } from '@angular/core';
import { RealtimeDatabaseService } from '../../../core/firebase/realtime-database.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private defaultCategories = [
    'Food',
    'Transport',
    'Entertainment',
    'Health',
    'Shopping',
    'Bills',
    'Education',
    'Savings',
  ];

  constructor(private dbService: RealtimeDatabaseService<any>) {}

  async setDefaultCategories(): Promise<void> {
    for (const category of this.defaultCategories) {
      await this.dbService.add('/categories', { name: category });
    }
  }

  async addDefaultCategoryMarker(userId: string): Promise<void> {
    await this.dbService.add(`/user/${userId}/defaultCategories`, '00000000');
  }

  getDefaultCategoryMarker(userId: string): any {
    return this.dbService.getAll(`/user/${userId}/defaultCategories`);
  }

  getAllUserCategories(userId: string): any {
    return this.dbService.getAll(`/user/${userId}/categories`);
  }

  getDefaultCategories(): any {
    return this.dbService.getAll('/categories');
  }

  async editDefaultCategoryMarker(
    userId: string,
    id: string,
    newMarkerValue: string
  ): Promise<void> {
    await this.dbService.update(`/user/${userId}/defaultCategories`, id, {
      value: newMarkerValue,
    });
  }

  async addCategory(userId: string, category: string): Promise<string> {
    return await this.dbService.add(`/user/${userId}/categories`, {
      name: category,
    });
  }

  async editCategory(
    userId: string,
    categoryId: string,
    updatedCategory: string
  ): Promise<void> {
    await this.dbService.update(`/user/${userId}/categories`, categoryId, {
      name: updatedCategory,
    });
  }

  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    await this.dbService.delete(`/user/${userId}/categories`, categoryId);
  }

  processResponse(response: { id: string; name: string }[]): string[] {
    return response.map((x) => x.name);
  }
}
