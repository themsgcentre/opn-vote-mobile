import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-question-dialog',
  templateUrl: './question-dialog.component.html',
  styleUrls: ['./question-dialog.component.scss'],
})
export class QuestionDialogComponent {

  @Output() yesClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() noClicked: EventEmitter<void> = new EventEmitter<void>();
  @Input() question: string = '';
  @Input() title: string = 'Frage'
}
