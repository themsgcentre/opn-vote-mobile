import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, NgZone, Output } from '@angular/core';
import { TranslatePipe } from 'src/app/i18n/translate.pipe';

@Component({
  selector: 'app-import-dialog',
  standalone: true,
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
})
export class ImportDialogComponent {
  private readonly ngZone = inject(NgZone);

  @Input() item: string | null = null;
  @Input() additionalInfo: string | null = null;
  @Input() uploadAccept = 'application/pdf,.pdf';
  @Input() allowMultipleFiles = false;

  @Output() scanSelected = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<File>();
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() dismissed = new EventEmitter<void>();

  protected onBackdropClick(): void {
    this.dismissed.emit();
  }

  protected onUploadInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = input.files;
    this.ngZone.run(() => {
      if (!list?.length) {
        return;
      }
      if (this.allowMultipleFiles) {
        this.filesSelected.emit(Array.from(list));
      } else {
        this.fileSelected.emit(list[0]);
      }
    });
    input.value = '';
  }
}
