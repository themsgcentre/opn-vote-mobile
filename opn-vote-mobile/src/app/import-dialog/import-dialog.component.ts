import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
})
export class ImportDialogComponent {
  @Input() item: string | null = null;
  @Output() scanSelected: EventEmitter<void> = new EventEmitter<void>(); 
  @Output() uploadSelected: EventEmitter<void> = new EventEmitter<void>(); 
}
