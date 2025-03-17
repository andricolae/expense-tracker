import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
  Type,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';

export interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private dialogComponentRef: ComponentRef<ConfirmDialogComponent> | null =
    null;

  constructor(
    private appRef: ApplicationRef,
    private environmentInjector: EnvironmentInjector
  ) {}

  confirm(options: ConfirmDialogOptions = {}): Observable<boolean> {
    const result = new Subject<boolean>();

    this.dialogComponentRef = createComponent(ConfirmDialogComponent, {
      environmentInjector: this.environmentInjector,
    });

    const instance = this.dialogComponentRef.instance;
    instance.title = options.title || 'Confirm';
    instance.message = options.message || 'Are you sure you want to delete?';
    instance.confirmText = options.confirmText || 'Delete';
    instance.cancelText = options.cancelText || 'Cancel';
    instance.visible = true;

    instance.confirm.subscribe(() => {
      result.next(true);
      result.complete();
      this.removeComponent();
    });

    instance.cancel.subscribe(() => {
      result.next(false);
      result.complete();
      this.removeComponent();
    });

    document.body.appendChild(this.dialogComponentRef.location.nativeElement);

    this.appRef.attachView(this.dialogComponentRef.hostView);

    return result.asObservable();
  }

  private removeComponent(): void {
    if (this.dialogComponentRef) {
      this.appRef.detachView(this.dialogComponentRef.hostView);
      this.dialogComponentRef.destroy();
      this.dialogComponentRef = null;
    }
  }
}
