import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgClass } from '@angular/common';
import { ImageComponent } from 'src/app/home-page/image/image.component';
import { ElectionInformation } from 'src/app/interfaces/election';

@Component({
  selector: 'app-election-detail',
  standalone: true,
  templateUrl: './election-detail.component.html',
  styleUrls: ['./election-detail.component.scss'],
  imports: [ImageComponent, NgClass]
})
export class ElectionDetailComponent implements OnChanges {
  @Input() election: ElectionInformation | null = null;
  @Output() participateClicked: EventEmitter<void> = new EventEmitter<void>();

  isBeforeRegistration = false;
  isRegistrationOpen = false;
  isVotingOpen = false;
  isElectionFinished = false;

  phaseLabel = '';
  phaseClass = '';

  ngOnChanges(): void {
    if (!this.election) return;

    const now = Date.now();

    const registrationStart = new Date(this.election.registrationStart).getTime();
    const registrationEnd = new Date(this.election.registrationEnd).getTime();
    const votingStart = new Date(this.election.votingStart).getTime();
    const votingEnd = new Date(this.election.votingEnd).getTime();

    this.isBeforeRegistration = now < registrationStart;
    this.isRegistrationOpen = now >= registrationStart && now < registrationEnd;
    this.isVotingOpen = now >= votingStart && now < votingEnd;
    this.isElectionFinished = now >= votingEnd;

    if (this.isElectionFinished) {
      this.phaseLabel = 'Beendet';
      this.phaseClass = 'ended';
    } else if (this.isVotingOpen) {
      this.phaseLabel = 'Abstimmung läuft';
      this.phaseClass = 'voting';
    } else if (this.isRegistrationOpen) {
      this.phaseLabel = 'Registrierung läuft';
      this.phaseClass = 'registration';
    } else if (this.isBeforeRegistration) {
      this.phaseLabel = 'Noch nicht gestartet';
      this.phaseClass = 'upcoming';
    } else {
      this.phaseLabel = 'Geplant';
      this.phaseClass = 'upcoming';
    }
  }

  get canVote(): boolean {
    return this.isVotingOpen;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date));
  }
}
