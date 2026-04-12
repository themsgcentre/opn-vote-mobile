import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent {

  @Output() okClicked: EventEmitter<void> = new EventEmitter<void>();
  @Input() message: string = '';
  @Input() title: string = 'Information';
  @Input() linkUrl?: string;
  @Input() linkLabel?: string;

}
