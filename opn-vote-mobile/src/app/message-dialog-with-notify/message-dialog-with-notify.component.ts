import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IonToggle } from '@ionic/angular/standalone';
import { TranslatePipe } from '../i18n/translate.pipe';

@Component({
  selector: 'app-message-dialog-with-notify',
  standalone: true,
  templateUrl: './message-dialog-with-notify.component.html',
  styleUrls: ['./message-dialog-with-notify.component.scss'],
  imports: [TranslatePipe, IonToggle],
})
export class MessageDialogWithNotifyComponent implements OnChanges {
  @Input() message = '';
  @Input() title = '';
  @Input() linkUrl?: string;
  @Input() linkLabel?: string;
  @Input() initialNotifyEnabled = false;

  @Output() okClicked = new EventEmitter<void>();
  @Output() notifyEnabledChange = new EventEmitter<boolean>();

  notifyEnabled = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialNotifyEnabled']) {
      this.notifyEnabled = this.initialNotifyEnabled;
    }
  }

  onNotifyToggle(event: CustomEvent<{ checked: boolean }>): void {
    this.notifyEnabled = event.detail.checked;
    this.notifyEnabledChange.emit(this.notifyEnabled);
  }
}
