import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { of } from 'rxjs';

import { BallotService } from 'src/app/services/ballot-service';
import { ElectionService } from 'src/app/services/election-service';
import { VoteDraftService } from 'src/app/services/vote-draft-service';
import { VoteParticipationStorageService } from 'src/app/services/vote-participation-storage.service';
import { VoteService } from 'src/app/services/vote-service';
import { VotingReminderService } from 'src/app/services/voting-reminder-service';
import { VotingEndedNotificationService } from 'src/app/services/voting-ended-notification.service';
import { ElectionStatus } from 'src/app/models/election-status';
import type { ElectionInformation } from 'src/app/models/election-information';
import type { Question } from 'src/app/models/question';

import { VotingComponent } from './voting.component';
import { VoteOption } from 'src/app/voting-system/vote-option';

const mockElection: ElectionInformation = {
  id: 1,
  title: 'Fixture-Wahl Voting',
  summary: '',
  description: '',
  headerImage: { large: '', small: '' },
  backLink: '',
  author: '',
  authorizedVoterCount: 10,
  registeredVoterCount: 5,
  totalVotes: 0,
  registrationStart: new Date('2020-01-01'),
  registrationEnd: new Date('2020-06-01'),
  votingStart: new Date('2020-06-02'),
  votingEnd: new Date('2035-12-31'),
  status: ElectionStatus.Open,
};

const mockQuestions: Question[] = [
  { key: 0, text: 'Frage A', imageUrl: '' },
  { key: 1, text: 'Frage B', imageUrl: '' },
];

describe('VotingComponent', () => {
  let fixture: ComponentFixture<VotingComponent>;
  const navigateByUrl = jest.fn(() => Promise.resolve(true));
  const present = jest.fn();
  const alertCreate = jest.fn().mockResolvedValue({
    present,
  } as unknown as HTMLIonAlertElement);

  async function configure(
    routeId: string,
    overrides?: {
      election?: ElectionInformation | null;
      hasBallot?: boolean;
    },
  ) {
    TestBed.resetTestingModule();
    const election = overrides?.election ?? mockElection;
    const hasBallot = overrides?.hasBallot ?? true;
    await TestBed.configureTestingModule({
      imports: [VotingComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: routeId }) },
          },
        },
        { provide: Router, useValue: { navigateByUrl } },
        {
          provide: ElectionService,
          useValue: {
            getElectionInformation: () => of(election),
            getQuestions: () => of(mockQuestions),
            getPublicKey: () => of('0x' + 'ab'.repeat(32)),
          },
        },
        { provide: VoteService, useValue: { sendVotes: jest.fn(() => Promise.resolve('0x' + 'cc'.repeat(32))) } },
        { provide: VoteDraftService, useValue: { load: async () => null, save: jest.fn() } },
        { provide: VotingReminderService, useValue: { isReminderScheduled: async () => false } },
        {
          provide: VotingEndedNotificationService,
          useValue: {
            isEnabled: async () => false,
            setEnabled: async () => ({ ok: true as const }),
          },
        },
        {
          provide: BallotService,
          useValue: {
            hasBallot: () => of(hasBallot),
            getCredentials: () =>
              of({
                electionId: 1,
                voterWallet: { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', privateKey: '0x01' },
                unblindedElectionToken: { hexString: '0x' + 'b'.repeat(64), isMaster: false, isBlinded: false },
                unblindedSignature: { hexString: '0x03' + '9'.repeat(510), isBlinded: false },
                encryptionKey: { hexString: '0x' + '11'.repeat(32), encryptionType: 0 },
              } as never),
          },
        },
        { provide: VoteParticipationStorageService, useValue: { recordVoteCast: jest.fn(() => Promise.resolve()) } },
        {
          provide: AlertController,
          useValue: { create: alertCreate } as unknown as AlertController,
        },
      ],
    }).compileComponents();

    return TestBed.createComponent(VotingComponent);
  }

  beforeEach(async () => {
    fixture = await configure('1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('gnosisscanTxUrl is null without a successful tx hash', () => {
    fixture.componentInstance.voteSuccessTxHash = null;
    expect(fixture.componentInstance.gnosisscanTxUrl).toBeNull();
  });

  it('gnosisscanTxUrl points at gnosisscan when tx hash is set', () => {
    fixture.componentInstance.voteSuccessTxHash = '0xabc123';
    expect(fixture.componentInstance.gnosisscanTxUrl).toContain('gnosisscan.io');
    expect(fixture.componentInstance.gnosisscanTxUrl).toContain('0xabc123');
  });

  it('onVoteSuccessOkay clears success state', () => {
    const c = fixture.componentInstance;
    c.voteSuccessTxHash = '0xdead';
    c.successElectionForNotify = mockElection;
    c.onVoteSuccessOkay();
    expect(c.voteSuccessTxHash).toBeNull();
    expect(c.successElectionForNotify).toBeNull();
  });

  it('isBeforeVotingStart compares election voting start to now', () => {
    const c = fixture.componentInstance;
    const farFuture = { ...mockElection, votingStart: new Date('2099-01-01') };
    expect(c.isBeforeVotingStart(farFuture)).toBe(true);
    expect(c.isBeforeVotingStart(mockElection)).toBe(false);
  });

  it('formatVotingStart returns a non-empty formatted string', () => {
    const s = fixture.componentInstance.formatVotingStart(mockElection);
    expect(s.length).toBeGreaterThan(0);
  });

  it('voteUpdated fills votes and enables submit when all questions answered', () => {
    const c = fixture.componentInstance;
    expect(c.questionCount).toBe(2);
    c.voteUpdated({ key: 0, selected: VoteOption.Yes });
    expect(c.canSubmit).toBe(false);
    c.voteUpdated({ key: 1, selected: VoteOption.No });
    expect(c.canSubmit).toBe(true);
    expect(c.votes[0]).toBe(VoteOption.Yes);
    expect(c.votes[1]).toBe(VoteOption.No);
  });

  it('shows ballot missing when there is no ballot', async () => {
    const f = await configure('1', { hasBallot: false });
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Wahlzettel konnte nicht erkannt werden');
  });

  it('presents an error alert for an invalid election id in the route', async () => {
    const f = await configure('not-a-number');
    f.detectChanges();
    await f.whenStable();
    expect(alertCreate).toHaveBeenCalled();
    expect(present).toHaveBeenCalled();
  });
});
