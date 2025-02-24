import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, query, where, doc, deleteDoc, updateDoc, addDoc } from '@angular/fire/firestore';
import { Expense, DayOfWeek, CreateExpenseDTO, UpdateExpenseDTO, FirestoreExpenseDoc, Category } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private readonly days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  private readonly categories: Category[] = ['groceries', 'taxes', 'entertainment', 'education', 'clothing', 'healthcare', 'sports', 'travel', 'gifts', 'miscellaneous'];

  private firestore: Firestore = inject(Firestore);

  /**
* Inserts an Item for the specified params
* @param day - The day of the week (e.g., 'monday', 'tuesday')
* @param _category - The category of the expense
* @param _amount - The amount of the expense
* @returns Promise containing an array of entries with their IDs and data
*/
  async addItem(day: DayOfWeek, expense: CreateExpenseDTO): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(this.firestore, day), {
        ...expense
      });
      return docRef.id;
    } catch (e) {
      console.error('Error adding document: ', e);
      return null;
    }
  }

  /**
  * Returns all the entries for a specific day
  * @param day - The day of the week (e.g., 'monday', 'tuesday')
  * @returns List of objects {category, amount}
  */
  async getByDay(day: string): Promise<Expense[]> {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, day));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Expense));
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  /**
 * Returns all the entries for a specific day and a specific category
 * @param day - The day of the week (e.g., 'monday', 'tuesday')
 * @param category - The category for which we are searching the entries
 * @returns List of objects {category, amount}
 */
  async getByDayAndCategory(day: DayOfWeek, category: Category): Promise<Expense[]> {
    try {
      const q = query(
        collection(this.firestore, day),
        where("category", "==", category)
      );
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Expense));
      console.log(`Items for ${day} in category ${category}:`, items);
      return items;
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  /**
* Returns all the entries for a specific category, no matter the day
* @param category - The category for which we are searching the entries
* @returns List of objects {category, amount}
*/
  async getByCategoryAllDays(category: Category): Promise<Expense[]> {
    try {
      const allItems: Expense[] = [];

      for (const day of this.days) {
        const q = query(
          collection(this.firestore, day),
          where("category", "==", category)
        );
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          day: day,
          ...doc.data() as FirestoreExpenseDoc
        }));

        allItems.push(...items);
      }

      console.log(`All items in category ${category}:`, allItems);
      return allItems;
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  /**
  * Deletes an item
  * @param day - The day of the week (e.g., 'monday', 'tuesday')
  * @param id - The id of the entry
  * @returns Boolean wether the delete has been successful
  */
  async deleteItem(day: DayOfWeek, id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(this.firestore, day, id));
      console.log(`Successfully deleted document ${id} from ${day}`);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  /**
  * Updates an entry
  * @param day - The day of the week (e.g., 'monday', 'tuesday')
  * @param id - The id of the entry
  * @param newData - The new data to be updated (optional category and optional amount)
  * @returns Boolean wether the update has been successful
  */
  async updateItem(day: DayOfWeek, id: string, newData: UpdateExpenseDTO) {
    try {
      const validatedData: UpdateExpenseDTO = {
        ...newData,
        amount: newData.amount ? Number(newData.amount) : undefined
      };

      await updateDoc(doc(this.firestore, day, id), validatedData);
      console.log(`Successfully updated document ${id} in ${day}`, validatedData);
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      return false;
    }
  }
}
