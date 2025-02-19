import { Component, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dummy-crud',
  imports: [CommonModule, FormsModule],
  styleUrl: './dummy-crud.component.css',
  templateUrl: './dummy-crud.component.html',
})
export class DummyCrudComponent {

  private firestore: Firestore = inject(Firestore);

  ngOnInit() {
    // this.addItem("monday", "funsies", "35.99");
    // this.getByDay("monday");
    // this.getByDayAndCategory("monday", "clothes");
    // this.getByCategoryAllDays("groceries");
    // this.deleteItem("monday", "qtRGTphuDFLgf1GJsGPe");
    // this.updateItem("monday", "b72k5qEHjuZXnbasZsOy", {amount: "104.89"});
  }

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
