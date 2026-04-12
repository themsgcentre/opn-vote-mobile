import { TestBed } from '@angular/core/testing';
import { VotingCountdownComponent } from './voting-countdown.component';
import type { ElectionInformation } from 'src/app/interfaces/election';

function election(overrides: Partial<ElectionInformation> = {}): ElectionInformation {
  const base = new Date('2026-01-01T12:00:00');
  return {
    id: 1,
    title: 'Test',
    summary: '',
    description: '',
    headerImage: { large: '', small: '' },
    backLink: '',
    author: '',
    authorizedVoterCount: 0,
    registeredVoterCount: 0,
    totalVotes: 0,
    registrationStart: new Date(base.getTime() - 86400000),
    registrationEnd: new Date(base.getTime() + 86400000),
    votingStart: new Date(base.getTime() + 172800000),
    votingEnd: new Date(base.getTime() + 259200000),
    status: 0,
    ...overrides,
  };
}

describe('VotingCountdownComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [VotingCountdownComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(VotingCountdownComponent);
    fixture.componentRef.setInput('election', election());
    fixture.componentRef.setInput('showCountdown', false);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
