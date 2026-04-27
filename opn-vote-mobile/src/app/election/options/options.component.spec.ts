import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsComponent } from './options.component';
import { VoteOption } from '../../voting-system/vote-option';
import type { Option } from '../../models/option';

const threeOptions: Option[] = [
  { text: 'Ich stimme zu.', voteOption: VoteOption.Yes },
  { text: 'Ich stimme nicht zu.', voteOption: VoteOption.No },
  { text: 'Ich enthalte mich.', voteOption: VoteOption.Abstain },
];

describe('OptionsComponent', () => {
  let fixture: ComponentFixture<OptionsComponent>;
  let component: OptionsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', threeOptions);
    fixture.componentRef.setInput('groupname', 'g1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('classifies default option labels as approve, reject, abstain', () => {
    expect(component.isApprove(threeOptions[0]!)).toBe(true);
    expect(component.isReject(threeOptions[1]!)).toBe(true);
    expect(component.isAbstain(threeOptions[2]!)).toBe(true);
  });

  it('applies initialSelection to the matching option', () => {
    fixture.componentRef.setInput('initialSelection', VoteOption.No);
    fixture.detectChanges();
    expect(component.selectedOption?.voteOption).toBe(VoteOption.No);
  });

  it('emits selected when a choice is made', () => {
    const spy = jest.fn();
    component.selected.subscribe(spy);
    component.onBallotSelected(threeOptions[0]!);
    expect(spy).toHaveBeenCalledWith(VoteOption.Yes);
    expect(component.selectedOption?.voteOption).toBe(VoteOption.Yes);
  });
});
