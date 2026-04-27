import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionComponent } from './question.component';
import type { Question } from '../../models/question';
import { VoteOption } from '../../voting-system/vote-option';

const mockQuestion: Question = {
  key: 0,
  text: 'Soll die Fixture-Frage angenommen werden?',
  imageUrl: 'https://example.com/q.png',
};

describe('QuestionComponent', () => {
  let fixture: ComponentFixture<QuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionComponent);
    fixture.componentRef.setInput('question', mockQuestion);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the question title', () => {
    expect(fixture.nativeElement.textContent).toContain(mockQuestion.text);
  });

  it('emits VoteOption when the user selects an option', () => {
    const spy = jest.fn();
    fixture.componentInstance.optionSelected.subscribe(spy);
    const firstRadio = fixture.nativeElement.querySelector('input[type="radio"]') as HTMLInputElement;
    firstRadio.click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(VoteOption.Yes);
  });
});
