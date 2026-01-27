import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-masterkey-setup',
  templateUrl: './masterkey-setup.component.html',
  styleUrls: ['./masterkey-setup.component.scss'],
})
export class MasterkeySetupComponent {

  @Input() canSkip: boolean = false;
  @Output() createMasterKeyClicked = new EventEmitter<void>();
  @Output() importMasterKeyClicked = new EventEmitter<void>();
}
