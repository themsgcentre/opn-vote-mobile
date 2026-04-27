import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonContent, IonToggle } from '@ionic/angular/standalone';
import { combineLatest, filter, firstValueFrom, from, Observable, of, switchMap, take } from 'rxjs';
import { formatDateTime } from 'src/app/formatting/date-formatting';
import { TranslatePipe } from 'src/app/i18n/translate.pipe';
import { TranslationService } from 'src/app/i18n/translation.service';
import { ElectionInformation } from 'src/app/models/election-information';
import { Question } from 'src/app/models/question';
import { VoterCredentials } from 'src/app/models/voter-credentials';
import { MessageDialogWithNotifyComponent } from 'src/app/reusables/message-dialog-with-notify/message-dialog-with-notify.component';
import { QuestionListComponent } from 'src/app/question-list/question-list.component';
import { LineComponent } from 'src/app/reusables/line/line.component';
import { BallotService } from 'src/app/services/ballot-service';
import { ElectionService } from 'src/app/services/election-service';
import { VoteDraftService } from 'src/app/services/vote-draft-service';
import { VoteParticipationStorageService } from 'src/app/services/vote-participation-storage.service';
import { VoteService } from 'src/app/services/vote-service';
import { VotingEndedNotificationService } from 'src/app/services/voting-ended-notification.service';
import { VotingReminderService } from 'src/app/services/voting-reminder-service';
import { VoteOption } from 'src/app/voting-system/vote-option';
import { QuestionVote } from 'src/app/voting-system/vote';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss'],
  imports: [
    CommonModule,
    QuestionListComponent,
    IonContent,
    IonToggle,
    LineComponent,
    MessageDialogWithNotifyComponent,
    TranslatePipe,
  ],
})
export class VotingComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private electionService: ElectionService,
    private voteService: VoteService,
    private voteDraftService: VoteDraftService,
    private votingReminderService: VotingReminderService,
    private votingEndedNotificationService: VotingEndedNotificationService,
    private ballotService: BallotService,
    private router: Router,
    private alertController: AlertController,
    private voteParticipationStorage: VoteParticipationStorageService,
    readonly translation: TranslationService,
  ) {}

  election$: Observable<ElectionInformation | null> = new Observable();
  questions$: Observable<Question[]> = new Observable();
  hasBallot$: Observable<boolean> = new Observable();
  credentials$: Observable<VoterCredentials | null> = new Observable();
  publicKey$: Observable<string | undefined> = new Observable();
  electionId: number | null = null;

  questionCount = 0;
  canSubmit = false;
  votes: Record<number, VoteOption> = {};

  voteSubmitting = false;
  voteSuccessTxHash: string | null = null;
  voteEndedNotifyPreference = false;
  successElectionForNotify: ElectionInformation | null = null;

  reminderScheduled = false;
  reminderFeedback: string | null = null;
  reminderRequesting = false;

  private static readonly GNOSISSCAN_TX_BASE = 'https://gnosisscan.io/tx/';

  get gnosisscanTxUrl(): string | null {
    return this.voteSuccessTxHash
      ? `${VotingComponent.GNOSISSCAN_TX_BASE}${this.voteSuccessTxHash}`
      : null;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const electionId = idParam ? Number(idParam) : NaN;

    if (!isNaN(electionId)) {
      this.electionId = electionId;
      this.election$ = this.electionService.getElectionInformation(electionId);
      this.questions$ = this.electionService.getQuestions(electionId);
      this.questions$.subscribe((questions) => {
        this.questionCount = questions.length;
        this.updateCanSubmit();
      });
      void this.restoreVoteDraft(electionId);
      this.hasBallot$ = this.ballotService.hasBallot(electionId);
      this.publicKey$ = this.electionService.getPublicKey(electionId);
      this.credentials$ = this.ballotService.getCredentials(electionId);

      this.election$
        .pipe(
          filter((e): e is ElectionInformation => e != null),
          take(1),
          switchMap((e) =>
            this.electionId != null && this.isBeforeVotingStart(e)
              ? from(this.votingReminderService.isReminderScheduled(this.electionId, e.votingStart))
              : of(false),
          ),
        )
        .subscribe((scheduled) => {
          this.reminderScheduled = scheduled;
        });
    } else {
      void this.presentVoteError(this.translation.translate('voting.invalidElectionId'));
    }
  }

  isBeforeVotingStart(election: ElectionInformation): boolean {
    return Date.now() < election.votingStart.getTime();
  }

  formatVotingStart(election: ElectionInformation): string {
    return formatDateTime(election.votingStart);
  }

  async onReminderToggle(event: Event, election: ElectionInformation): Promise<void> {
    if (this.electionId == null) {
      return;
    }
    const detail = (event as CustomEvent<{ checked: boolean }>).detail;
    const wantOn = detail?.checked ?? false;

    this.reminderFeedback = null;
    this.reminderRequesting = true;
    try {
      if (wantOn) {
        const result = await this.votingReminderService.scheduleVotingStartReminder({
          electionId: this.electionId,
          votingStart: election.votingStart,
          electionTitle: election.title,
        });
        if (result.ok) {
          this.reminderScheduled = true;
        } else {
          this.reminderScheduled = false;
          this.reminderFeedback = result.reason;
        }
      } else {
        const cancelResult =
          await this.votingReminderService.cancelVotingStartReminder(this.electionId);
        if (cancelResult.ok) {
          this.reminderScheduled = false;
        } else {
          this.reminderScheduled = true;
          await this.presentVoteError(cancelResult.reason);
        }
      }
    } finally {
      this.reminderRequesting = false;
    }
  }

  voteUpdated(vote: QuestionVote): void {
    this.votes[vote.key] = vote.selected;
    this.updateCanSubmit();
    if (this.electionId != null) {
      void this.voteDraftService.save(this.electionId, this.votes);
    }
  }

  async submitVote(): Promise<void> {
    if (this.voteSubmitting) {
      return;
    }

    this.voteSubmitting = true;

    try {
      const [credentials, publicKey] = await firstValueFrom(
        combineLatest([this.credentials$, this.publicKey$]),
      );

      if (!credentials) {
        await this.presentVoteError(this.translation.translate('voting.missingCredentials'));
        return;
      }

      if (!publicKey) {
        await this.presentVoteError(this.translation.translate('voting.missingPublicKey'));
        return;
      }

      const txHash = await this.voteService.sendVotes(this.votes, credentials, publicKey);

      if (this.electionId != null) {
        void this.voteParticipationStorage.recordVoteCast(this.electionId);
        try {
          const election = await firstValueFrom(
            this.election$.pipe(
              filter((e): e is ElectionInformation => e != null),
              take(1),
            ),
          );
          this.successElectionForNotify = election;
          this.voteEndedNotifyPreference = await this.votingEndedNotificationService.isEnabled(
            this.electionId,
          );
        } catch {
          this.successElectionForNotify = null;
          this.voteEndedNotifyPreference = false;
        }
      } else {
        this.successElectionForNotify = null;
        this.voteEndedNotifyPreference = false;
      }

      this.voteSuccessTxHash = txHash;
    } catch {
      await this.presentVoteError(this.translation.translate('voting.sendError'));
    } finally {
      this.voteSubmitting = false;
    }
  }

  onVoteSuccessOkay(): void {
    this.voteSuccessTxHash = null;
    this.successElectionForNotify = null;
    this.onVoteSuccessAcknowledged();
  }

  async onVoteSuccessNotifyToggled(enabled: boolean): Promise<void> {
    if (this.electionId == null || this.successElectionForNotify == null) {
      return;
    }
    const result = await this.votingEndedNotificationService.setEnabled({
      electionId: this.electionId,
      votingEnd: this.successElectionForNotify.votingEnd,
      electionTitle: this.successElectionForNotify.title,
      enabled,
    });
    if (result.ok) {
      this.voteEndedNotifyPreference = enabled;
    } else {
      this.voteEndedNotifyPreference = false;
      if (enabled) {
        await this.presentVoteError(result.reason);
      }
    }
  }

  onVoteSuccessAcknowledged(): void {
    void this.router.navigateByUrl('election/detail/' + this.electionId);
  }

  private async presentVoteError(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translation.translate('common.error'),
      message,
      buttons: [{ text: this.translation.translate('common.ok'), role: 'cancel' }],
    });
    await alert.present();
  }

  private updateCanSubmit(): void {
    this.canSubmit = Object.keys(this.votes).length === this.questionCount && this.questionCount > 0;
  }

  private async restoreVoteDraft(electionId: number): Promise<void> {
    const draft = await this.voteDraftService.load(electionId);
    if (!draft) {
      return;
    }
    this.votes = { ...draft };
    this.updateCanSubmit();
  }
}
