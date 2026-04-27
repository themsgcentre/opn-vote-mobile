import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-ballot-import',
  standalone: true,
  templateUrl: './ballot-import.component.html',
  styleUrls: ['./ballot-import.component.scss'],
  imports: [TranslatePipe],
})
export class BallotImportComponent {
  @Input() importError: string | null = null;
  @Output() infoClicked = new EventEmitter<void>();
  @Output() importClicked = new EventEmitter<void>();
}
