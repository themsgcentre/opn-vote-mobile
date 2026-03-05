import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, filter, finalize, shareReplay, take } from 'rxjs';
import { BallotService } from 'src/app/services/ballot-service';

@Component({
  selector: 'app-ballot-paper-setup',
  templateUrl: './ballot-paper-setup.component.html',
  styleUrls: ['./ballot-paper-setup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe]
})
export class BallotPaperSetupComponent  implements OnInit {

  loading = false;
  electionId!: number;
  private readonly ballotPaperSubject = new BehaviorSubject<string | undefined>(undefined);
  readonly ballotPaper$ = this.ballotPaperSubject.asObservable();

  constructor(
    private ballotPaperService: BallotService ,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.electionId = Number(this.route.snapshot.paramMap.get('id')!);
    this.ballotPaper$.pipe(
      filter((k) => k !== undefined),
      take(1)
    ).subscribe(() => {
      this.router.navigate([
        '/election/vote',
        this.electionId
      ]);
    });
    this.loadVoteKey();
  }

  private loadVoteKey() {
    this.loading = true;
    this.ballotPaperService.getBallotPaper(this.electionId).pipe(
      finalize(() => this.loading = false),
      shareReplay(1)
    ).subscribe(ballotPaper => this.ballotPaperSubject.next(ballotPaper));
  }

  createBallotPaper() {
    this.loading = true;
    this.ballotPaperService
      .setBallotPaper('new-generated-ballot-paper')
      .pipe(finalize(() => this.loading = false))
      .subscribe(() => this.loadVoteKey()); 
  }

  importBallotPaper() {
    console.log("importBallotPaper");
  }

}
