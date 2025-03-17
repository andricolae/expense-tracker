import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  public loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  showSpinner() {
    // console.log('showSpinner');
    this.loadingSubject.next(true);
  }

  hideSpinner() {
    // console.log('hideSpinner');
    this.loadingSubject.next(false);
  }
}
