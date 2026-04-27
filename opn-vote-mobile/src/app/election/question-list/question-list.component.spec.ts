import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionListComponent } from './question-list.component';
import type { Question } from '../../models/question';
import { VoteOption } from '../../models/vote-option';

const questions: Question[] = [
  { key: 0, text: 'Frage 1', imageUrl: '' },
  { key: 1, text: 'Frage 2', imageUrl: '' },
];

describe('QuestionListComponent', () => {
  let fixture: ComponentFixture<QuestionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionListComponent);
    fixture.componentRef.setInput('questions', questions);
    fixture.componentRef.setInput('initialVotes', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits optionSelected with question key when an option is chosen', () => {
    const spy = jest.fn();
    fixture.componentInstance.optionSelected.subscribe(spy);

    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(radios.length).toBeGreaterThanOrEqual(3);
    (radios[1] as HTMLInputElement).click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    const arg = spy.mock.calls[0]![0] as { key: number; selected: VoteOption };
    expect(arg.key).toBe(0);
    expect(arg.selected).toBe(VoteOption.No);
  });
});
