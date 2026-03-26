import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-import-dialog',
  standalone: true,
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
})
export class ImportDialogComponent {
  @Input() item: string | null = null;
  @Input() additionalInfo: string | null = null;
  @Input() uploadAccept = 'application/pdf,.pdf';

  @Output() scanSelected = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<File>();

  protected onUploadInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) {
      this.fileSelected.emit(file);
    }
  }
}
