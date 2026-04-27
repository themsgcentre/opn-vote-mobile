import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectionDetailComponent } from './election-detail.component';
import { ElectionStatus } from '../../models/election-status';
import type { ElectionInformation } from '../../models/election-information';
import type { VoteResult } from '../../models/vote-result';

function baseElection(overrides: Partial<ElectionInformation> = {}): ElectionInformation {
  return {
    id: 1,
    title: 'Fixture-Wahl',
    summary: '',
    description: 'Beschreibung',
    headerImage: { large: '', small: '' },
    backLink: '',
    author: 'Autor',
    authorizedVoterCount: 100,
    registeredVoterCount: 50,
    totalVotes: 10,
    registrationStart: new Date('2025-06-01T00:00:00.000Z'),
    registrationEnd: new Date('2025-06-30T23:59:59.000Z'),
    votingStart: new Date('2025-07-01T00:00:00.000Z'),
    votingEnd: new Date('2025-07-31T23:59:59.000Z'),
    status: ElectionStatus.Open,
    ...overrides,
  };
}

describe('ElectionDetailComponent', () => {
  let fixture: ComponentFixture<ElectionDetailComponent>;
  let component: ElectionDetailComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElectionDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ElectionDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('sets phase to voting when now is within the voting window', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-07-10T12:00:00.000Z').getTime());
    fixture.componentRef.setInput('election', baseElection());
    fixture.detectChanges();
    expect(component.isVotingOpen).toBe(true);
    expect(component.phaseClass).toBe('voting');
    expect(component.phaseLabel.length).toBeGreaterThan(0);
  });

  it('sets phase to registration when registration is open and voting has not started', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-06-15T12:00:00.000Z').getTime());
    fixture.componentRef.setInput('election', baseElection());
    fixture.detectChanges();
    expect(component.isRegistrationOpen).toBe(true);
    expect(component.phaseClass).toBe('registration');
  });

  it('sets phase to ended when voting has ended', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-08-10T12:00:00.000Z').getTime());
    fixture.componentRef.setInput('election', baseElection());
    fixture.detectChanges();
    expect(component.isElectionFinished).toBe(true);
    expect(component.phaseClass).toBe('ended');
  });

  it('marks results as published from election status', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-08-10T12:00:00.000Z').getTime());
    fixture.componentRef.setInput(
      'election',
      baseElection({ status: ElectionStatus.ResultsPublished }),
    );
    fixture.detectChanges();
    expect(component.resultsPublished).toBe(true);
  });

  it('getStatValueClass scales by digit count', () => {
    expect(component.getStatValueClass(42)).toBe('stat-value-large');
    expect(component.getStatValueClass(1234)).toBe('stat-value-medium');
    expect(component.getStatValueClass(123456)).toBe('stat-value-small');
    expect(component.getStatValueClass(1234567)).toBe('stat-value-xsmall');
  });

  it('getResultSegments computes bar heights from vote totals', () => {
    const result: VoteResult = {
      questionText: 'Q1',
      yesVotes: 25,
      noVotes: 50,
      invalidVotes: 25,
    };
    const segments = component.getResultSegments(result);
    expect(segments).toHaveLength(3);
    expect(segments[0]!.height).toBe(25);
    expect(segments[1]!.height).toBe(50);
    expect(segments[2]!.height).toBe(25);
  });

  it('emits participateClicked when the vote button is clicked during voting', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-07-10T12:00:00.000Z').getTime());
    const spy = jest.fn();
    component.participateClicked.subscribe(spy);
    fixture.componentRef.setInput('election', baseElection());
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.vote-button') as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
