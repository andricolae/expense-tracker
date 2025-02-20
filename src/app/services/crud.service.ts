import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, query, where, doc, deleteDoc, updateDoc, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private firestore: Firestore = inject(Firestore);

  /**
* Inserts an Item for the specified params
* @param day - The day of the week (e.g., 'monday', 'tuesday')
* @param _category - The category of the expense
* @param _amount - The amount of the expense
* @returns Promise containing an array of entries with their IDs and data
*/
  async addItem(day: string, _category: string, _amount: string) {
    try {
      const docRef = await addDoc(collection(this.firestore, day), {
        category: _category,
        amount: _amount
      });

      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  /**
  * Returns all the entries for a specific day
  * @param day - The day of the week (e.g., 'monday', 'tuesday')
  * @returns List of objects {category, amount}
  */
  async getByDay(day: string) {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, day));
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`Items for ${day}:`, items);
      return items;
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
  async getByDayAndCategory(day: string, category: string) {
    try {
      const q = query(
        collection(this.firestore, day),
        where("category", "==", category)
      );
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
  async getByCategoryAllDays(category: string) {
    try {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const allItems = [];

      for (const day of days) {
        const q = query(
          collection(this.firestore, day),
          where("category", "==", category)
        );
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          day: day,
          ...doc.data()
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
  async deleteItem(day: string, id: string) {
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
  async updateItem(day: string, id: string, newData: { category?: string, amount?: string }) {
    try {
      await updateDoc(doc(this.firestore, day, id), newData);
      console.log(`Successfully updated document ${id} in ${day}`, newData);
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      return false;
    }
  }
}
