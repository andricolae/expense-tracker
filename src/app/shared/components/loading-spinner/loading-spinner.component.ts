import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loading-spinner',
  imports: [NgIf],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css',
})
export class LoadingSpinnerComponent implements OnInit, OnDestroy {
  public isLoading = false;
  private spinnerSub!: Subscription;

  constructor(public spinnerService: SpinnerService) {}

  ngOnInit(): void {
    this.spinnerSub = this.spinnerService.loadingSubject.subscribe(
      (spinnerState) => {
        this.isLoading = spinnerState;
      }
    );
  }

  ngOnDestroy(): void {
    this.spinnerSub.unsubscribe();
  }
}
