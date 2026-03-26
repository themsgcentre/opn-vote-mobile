import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-file-picker',
  standalone: true,
  templateUrl: './file-picker.component.html',
  styleUrls: ['./file-picker.component.scss'],
})
export class FilePickerComponent {
  @Input() accept = '*';
  @Input() multiple = false;

  @Output() readonly fileSelected = new EventEmitter<File>();
  @Output() readonly filesSelected = new EventEmitter<File[]>();

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;
  open(): void {
    this.fileInput?.nativeElement.click();
  }

  protected onNativeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const list = input.files;
    input.value = '';
    if (!list?.length) {
      return;
    }
    const files = Array.from(list);
    if (this.multiple) {
      this.filesSelected.emit(files);
    } else {
      this.fileSelected.emit(files[0]);
    }
  }
}
