import { inject, Injectable, OnInit, signal } from '@angular/core';
import { CategoriesService } from '../../../features/expenses/expenses-crud/categories.service';
import { AuthService } from '../../../core/authentication/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TrackerCategoryService {
  //user
  private authService = inject(AuthService);
  userId!: string;

  //categories
  private categoriesService = inject(CategoriesService);
  categories = signal<{ id: string; name: string; visible: boolean }[]>([]);
  categoriesMarker?: { marker: string; id: number };

  //INITIALIZATION------------------------------------------------------------------------------------

  constructor() {
    this.userId = this.authService.getId()!;
  }

  //get categories with the marker
  getCategories() {
    this.categoriesService
      .getDefaultCategoryMarker(this.userId)
      .subscribe((responseArray: any[]) => {
        if (!responseArray || responseArray.length === 0) {
          this.categoriesService
            .addDefaultCategoryMarker(this.userId)
            .then(() => {
              return this.getCategories();
            });
        } else {
          const response = responseArray[0];
          const id = Number(response.id);

          const numbersArray = Object.keys(response)
            .filter((key) => key !== 'id')
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => response[key]);

          const transformedData = this.transformResponse({
            id,
            numbers: numbersArray,
          });

          this.categoriesMarker = transformedData;
          console.log(this.categoriesMarker);

          this.loadCategories();
        }
      });
  }

  //concat default with user categories
  private loadCategories() {
    this.loadDefaultCategories().subscribe((response: any) => {
      this.loadPersonalCategories().subscribe((response2: any) => {
        response = this.processDefaultCategories(
          response,
          this.categoriesMarker!
        );
        this.categories.set([...response, ...response2]);
      });
    });
  }

  private loadDefaultCategories() {
    return this.categoriesService.getDefaultCategories();
  }

  private loadPersonalCategories() {
    return this.categoriesService.getAllUserCategories(this.userId);
  }

  //set visible atribute for default categories
  private processDefaultCategories(
    categories: { id: string; name: string; visible: boolean }[],
    categoriesMarker: { marker: string; id: number }
  ) {
    for (let i = 0; i < categories.length; i++) {
      categories[i].visible = categoriesMarker.marker[i] == '0';
    }

    return categories;
  }

  //process response of get marker method of default categories
  private transformResponse(response: { id: number; numbers: string[] }): {
    marker: string;
    id: number;
  } {
    return {
      marker: response.numbers.join(''),
      id: response.id,
    };
  }

  //CRUD OPERATIONS -----------------------------------------------------------------------------------------------

  addCategory(newCategoryName: string) {
    this.categoriesService
      .addCategory(this.userId, newCategoryName)
      .then(() => {
        this.getCategories();
      });
  }

  deleteCategory(categoryId: string) {
    const index = this.findCategoryIndex(categoryId);
    console.log(index);

    if (index < 8) {
      this.updateMarker(index, '1');
      this.categoriesService.editDefaultCategoryMarker(
        this.userId,
        this.categoriesMarker!.id.toString(),
        this.categoriesMarker!.marker
      );
    } else {
      this.categoriesService.deleteCategory(this.userId, categoryId);
    }

    this.loadCategories();
  }

  //UTILS FUNCTIONS
  findCategoryIndex(categoryId: string) {
    for (let i = 0; i < this.categories().length; i++) {
      if (this.categories()[i].id == categoryId) {
        return i;
      }
    }
    return -1;
  }

  private updateMarker(index: number, newChar: string): void {
    if (!this.categoriesMarker) return;

    let markerArray = this.categoriesMarker.marker.split('');

    if (index >= 0 && index < markerArray.length) {
      markerArray[index] = newChar;
    }

    this.categoriesMarker.marker = markerArray.join('');
    console.log(this.categoriesMarker.marker);
  }
}
