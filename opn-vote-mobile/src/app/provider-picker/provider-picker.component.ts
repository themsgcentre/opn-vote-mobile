import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-provider-picker',
  standalone: true,
  templateUrl: './provider-picker.component.html',
  styleUrls: ['./provider-picker.component.scss'],
})
export class ProviderPickerComponent  implements OnInit {

  @Output() openInfoPopup: EventEmitter<void> = new EventEmitter<void>();
  constructor() { }

  ngOnInit() {}

}
