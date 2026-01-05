import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-navigation-button',
  templateUrl: './navigation-button.component.html',
  styleUrls: ['./navigation-button.component.scss'],
  imports: [NgClass],
})
export class NavigationButtonComponent implements OnChanges {

  constructor() { }
  @Input() iconSelected: string = '';
  @Input() iconUnselected: string = '';
  @Input() iconSize: number = 24;
  @Input() selected: boolean = false;
  @Output() clicked = new EventEmitter<void>();
  iconType: string = '';

  ngOnChanges() {
    this.iconType = this.selected ? this.iconSelected : this.iconUnselected;
  }
}
