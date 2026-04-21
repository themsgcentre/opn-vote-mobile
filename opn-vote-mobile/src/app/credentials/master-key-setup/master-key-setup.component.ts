import { Component, EventEmitter, Output } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-master-key-setup',
  standalone: true,
  templateUrl: './master-key-setup.component.html',
  styleUrls: ['./master-key-setup.component.scss'],
  imports: [TranslatePipe],
})
export class MasterKeySetupComponent {
  @Output() createClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() importClicked: EventEmitter<void> = new EventEmitter<void>();
}
