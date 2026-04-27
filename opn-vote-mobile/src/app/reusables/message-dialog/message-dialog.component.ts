import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { TranslatePipe } from 'src/app/i18n/translate.pipe';
import { TranslationService } from 'src/app/i18n/translation.service';

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  imports: [TranslatePipe],
})
export class MessageDialogComponent {
  private readonly translation = inject(TranslationService);

  @Output() okClicked: EventEmitter<void> = new EventEmitter<void>();
  @Input() message: string = '';
  @Input() title: string = this.translation.translate('common.info');
  @Input() linkUrl?: string;
  @Input() linkLabel?: string;

}
