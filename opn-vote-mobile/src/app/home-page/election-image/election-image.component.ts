import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-election-image',
  templateUrl: './election-image.component.html',
  styleUrls: ['./election-image.component.scss'],
})
export class ElectionImageComponent {

  @Input() large: string = '';
  @Input() small: string = '';
  @Input() alt: string = '';
  @Input() takeLarge: boolean = false;

  constructor() { }

  get imageSrc(): string {
    return this.takeLarge ? this.large : this.small;
  }
}
