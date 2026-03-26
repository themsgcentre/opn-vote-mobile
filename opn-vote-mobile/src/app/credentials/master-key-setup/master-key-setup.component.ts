import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-master-key-setup',
  standalone: true,
  templateUrl: './master-key-setup.component.html',
  styleUrls: ['./master-key-setup.component.scss'],
})
export class MasterKeySetupComponent {
  @Output() createClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() importClicked: EventEmitter<void> = new EventEmitter<void>();
}
