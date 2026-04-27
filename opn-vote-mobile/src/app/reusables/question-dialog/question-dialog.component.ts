import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslationService } from '../../i18n/translation.service';

@Component({
  selector: 'app-question-dialog',
  standalone: true,
  templateUrl: './question-dialog.component.html',
  styleUrls: ['./question-dialog.component.scss'],
  imports: [TranslatePipe],
})
export class QuestionDialogComponent {
  private readonly translation = inject(TranslationService);

  @Output() yesClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() noClicked: EventEmitter<void> = new EventEmitter<void>();
  @Input() question: string = '';
  @Input() title: string = this.translation.translate('questionDialog.title');
}
