import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TranslatePipe } from '../i18n/translate.pipe';

@Component({
  selector: 'app-provider-picker',
  standalone: true,
  templateUrl: './provider-picker.component.html',
  styleUrls: ['./provider-picker.component.scss'],
  imports: [TranslatePipe],
})
export class ProviderPickerComponent  implements OnInit {

  @Output() openInfoPopup: EventEmitter<void> = new EventEmitter<void>();
  constructor() { }

  ngOnInit() {}

}
