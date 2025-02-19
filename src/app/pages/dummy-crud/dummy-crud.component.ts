import { Component, inject } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
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
  newItem: string = '';

  ngOnInit() {
    this.addItem();
  }

  async addItem() {
    this.newItem = "test Add --> " + new Date(Date.now());
    try {
      const docRef = await addDoc(collection(this.firestore, 'dummy|Items'), {
        name: this.newItem,
      });
      console.log('Document written with ID: ', docRef.id);
      this.newItem = '';
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }
}
