import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image',
  standalone: true,
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  imports: [CommonModule]
})
export class ImageComponent {

  @Input() large: string = '';
  @Input() small: string = '';
  @Input() alt: string = '';
  @Input() takeLarge: boolean = false;

  @Input() width?: string;
  @Input() height?: string;
  @Input() keepAspectRatio: boolean = true;
  @Input() fit: 'contain' | 'cover' = 'contain';

  constructor() { }

  get imageSrc(): string {
    return this.takeLarge ? this.large : this.small;
  }

  get styles() {
    return {
      width: this.width || 'auto',
      height: this.height || 'auto',
      objectFit: this.keepAspectRatio ? this.fit : 'fill'
    };
  }
}
