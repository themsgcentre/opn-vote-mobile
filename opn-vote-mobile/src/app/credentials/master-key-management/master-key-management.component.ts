import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MasterKeySetupComponent } from '../master-key-setup/master-key-setup.component';
import { TranslatePipe } from '../../i18n/translate.pipe';

export type MasterKeyPanelState = 'loading' | 'none' | 'present';

@Component({
  selector: 'app-master-key-management',
  standalone: true,
  templateUrl: './master-key-management.component.html',
  styleUrls: ['./master-key-management.component.scss'],
  imports: [MasterKeySetupComponent, TranslatePipe],
})
export class MasterKeyManagementComponent {
  @Input() state: MasterKeyPanelState = 'loading';
  @Input() importError: string | null = null;

  @Output() infoClicked = new EventEmitter<void>();
  @Output() createClicked = new EventEmitter<void>();
  @Output() importClicked = new EventEmitter<void>();
  @Output() exportClicked = new EventEmitter<void>();
  @Output() deleteClicked = new EventEmitter<void>();
}
