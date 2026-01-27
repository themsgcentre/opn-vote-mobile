import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-masterkey-options',
  templateUrl: './masterkey-options.component.html',
  styleUrls: ['./masterkey-options.component.scss'],
})
export class MasterkeyOptionsComponent {

  @Input() canSkip: boolean = false;
  @Output() createMasterKeyClicked = new EventEmitter<void>();
  @Output() importMasterKeyClicked = new EventEmitter<void>();
}
