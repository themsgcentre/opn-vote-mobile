import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
} from '@angular/core';
import { ElectionInformation } from 'src/app/models/election-information';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslationService } from '../../i18n/translation.service';
import { ElectionStatus } from 'src/app/models/election-status';

type CountdownState = 'none' | 'countdown' | 'open' | 'results' | 'closed';

@Component({
  selector: 'app-voting-countdown',
  standalone: true,
  templateUrl: './voting-countdown.component.html',
  styleUrls: ['./voting-countdown.component.scss'],
  imports: [TranslatePipe],
})
export class VotingCountdownComponent implements OnChanges, OnDestroy {
  private readonly translation = inject(TranslationService);
  @Input() election!: ElectionInformation;
  @Input() showCountdown = false;

  state: CountdownState = 'none';
  countdownText = '';

  private timer: ReturnType<typeof setInterval> | undefined;

  ngOnChanges(): void {
    this.stopTimer();
    if (!this.showCountdown || !this.election) {
      this.state = 'none';
      return;
    }
    this.refresh();
    this.timer = setInterval(() => this.refresh(), 1000);
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private stopTimer(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private refresh(): void {
    if (!this.showCountdown || !this.election) {
      this.state = 'none';
      return;
    }
    const now = Date.now();
    const regStart = this.election.registrationStart.getTime();
    const voteStart = this.election.votingStart.getTime();
    const voteEnd = this.election.votingEnd.getTime();

    if(this.election.status === ElectionStatus.ResultsPublished) {
      this.state = 'results';
      this.countdownText = '';
      return;
    }

    if(this.election.status === ElectionStatus.Ended) {
      this.state = 'closed';
      this.countdownText = '';
      return;
    }

    if (now < regStart || now > voteEnd) {
      this.state = 'none';
      this.countdownText = '';
      return;
    }
    if (now >= voteStart) {
      this.state = 'open';
      this.countdownText = '';
      return;
    }
    this.state = 'countdown';
    this.countdownText = this.formatRemaining(voteStart - now);
  }

  private formatRemaining(ms: number): string {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const s = totalSec % 60;
    const m = Math.floor(totalSec / 60) % 60;
    const h = Math.floor(totalSec / 3600) % 24;
    const d = Math.floor(totalSec / 86400);
    const pad = (n: number) => String(n).padStart(2, '0');
    if (d > 0) {
      const dayLabel = this.translation.translate(
        d === 1 ? 'votingCountdown.day' : 'votingCountdown.days',
      );
      return `${d} ${dayLabel}, ${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
}
