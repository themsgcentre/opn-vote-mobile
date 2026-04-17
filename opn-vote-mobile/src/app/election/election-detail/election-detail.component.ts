import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { ImageComponent } from 'src/app/home-page/image/image.component';
import { TranslatePipe } from 'src/app/i18n/translate.pipe';
import { TranslationService } from 'src/app/i18n/translation.service';
import { ElectionInformation } from 'src/app/models/election-information';
import { ElectionStatus } from 'src/app/models/election-status';
import { VoteResult } from 'src/app/models/vote-result';

@Component({
  selector: 'app-election-detail',
  standalone: true,
  templateUrl: './election-detail.component.html',
  styleUrls: ['./election-detail.component.scss'],
  imports: [ImageComponent, NgClass, TranslatePipe],
})
export class ElectionDetailComponent implements OnChanges {
  private readonly translation = inject(TranslationService);

  @Input() election: ElectionInformation | null = null;
  @Input() results: VoteResult[] | null = null;
  @Output() participateClicked: EventEmitter<void> = new EventEmitter<void>();

  isBeforeRegistration = false;
  isRegistrationOpen = false;
  isVotingOpen = false;
  isElectionFinished = false;
  resultsPublished = false;

  phaseLabel = '';
  phaseClass = '';

  ngOnChanges(): void {
    if (!this.election) {
      return;
    }

    const now = Date.now();

    const registrationStart = new Date(this.election.registrationStart).getTime();
    const registrationEnd = new Date(this.election.registrationEnd).getTime();
    const votingStart = new Date(this.election.votingStart).getTime();
    const votingEnd = new Date(this.election.votingEnd).getTime();

    this.isBeforeRegistration = now < registrationStart;
    this.isRegistrationOpen = now >= registrationStart && now < registrationEnd;
    this.isVotingOpen = now >= votingStart && now < votingEnd;
    this.isElectionFinished = now >= votingEnd;
    this.resultsPublished = this.election.status === ElectionStatus.ResultsPublished;
    

    if (this.isElectionFinished) {
      this.phaseLabel = this.translation.translate('electionDetail.phase.ended');
      this.phaseClass = 'ended';
    } else if (this.isVotingOpen) {
      this.phaseLabel = this.translation.translate('electionDetail.phase.voting');
      this.phaseClass = 'voting';
    } else if (this.isRegistrationOpen) {
      this.phaseLabel = this.translation.translate('electionDetail.phase.registration');
      this.phaseClass = 'registration';
    } else if (this.isBeforeRegistration) {
      this.phaseLabel = this.translation.translate('electionDetail.phase.upcoming');
      this.phaseClass = 'upcoming';
    } else {
      this.phaseLabel = this.translation.translate('electionDetail.phase.planned');
      this.phaseClass = 'upcoming';
    }
  }

  get canVote(): boolean {
    return this.isVotingOpen;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  }

  getStatValueClass(value: number): string {
    const digits = String(value).length;

    if (digits >= 7) {
      return 'stat-value-xsmall';
    }

    if (digits >= 6) {
      return 'stat-value-small';
    }

    if (digits >= 4) {
      return 'stat-value-medium';
    }

    return 'stat-value-large';
  }

  getResultSegments(result: VoteResult): Array<{ labelKey: string; value: number; cssClass: string; height: number }> {
    const totalVotes = this.getTotalResultVotes(result);

    return [
      {
        labelKey: 'electionDetail.approval',
        value: result.yesVotes,
        cssClass: 'approval',
        height: this.getBarHeight(result.yesVotes, totalVotes),
      },
      {
        labelKey: 'electionDetail.rejection',
        value: result.noVotes,
        cssClass: 'rejection',
        height: this.getBarHeight(result.noVotes, totalVotes),
      },
      {
        labelKey: 'electionDetail.abstention',
        value: result.invalidVotes,
        cssClass: 'abstention',
        height: this.getBarHeight(result.invalidVotes, totalVotes),
      },
    ];
  }

  private getTotalResultVotes(result: VoteResult): number {
    return result.yesVotes + result.noVotes + result.invalidVotes;
  }

  private getBarHeight(value: number, totalVotes: number): number {
    if (totalVotes <= 0) {
      return 0;
    }

    return (value / totalVotes) * 100;
  }
}
