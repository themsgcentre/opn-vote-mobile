import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-master-key-setup',
  templateUrl: './master-key-setup.component.html',
  styleUrls: ['./master-key-setup.component.scss'],
})
export class MasterKeySetupComponent {
  @Output() createClicked: EventEmitter<void> = new EventEmitter<void>();
}
