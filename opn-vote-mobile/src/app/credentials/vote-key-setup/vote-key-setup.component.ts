import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, filter, finalize, Observable, shareReplay, take, tap } from 'rxjs';
import { VoteKeyService } from 'src/app/services/vote-key-service';

@Component({
  selector: 'app-vote-key-setup',
  templateUrl: './vote-key-setup.component.html',
  styleUrls: ['./vote-key-setup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe]
})
export class VoteKeySetupComponent implements OnInit {

  loading = false;
  electionId!: number;
  private readonly voteKeySubject = new BehaviorSubject<string | undefined>(undefined);
  readonly voteKey$ = this.voteKeySubject.asObservable();

  constructor(
    private voteKeyService: VoteKeyService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.electionId = Number(this.route.snapshot.paramMap.get('id')!);
    this.voteKey$.pipe(
      filter((k) => k !== undefined),
      take(1)
    ).subscribe(() => {
      this.router.navigate([
        '/election/ballot-paper-setup',
        this.electionId
      ]);
    });
    this.loadVoteKey();
  }

  private loadVoteKey() {
    this.loading = true;
    this.voteKeyService.getVoteKey(this.electionId).pipe(
      finalize(() => this.loading = false),
      shareReplay(1)
    ).subscribe(voteKey => this.voteKeySubject.next(voteKey));
  }

  createVoteKey() {
    this.loading = true;
    this.voteKeyService
      .setVoteKey('new-generated-vote-key')
      .pipe(finalize(() => this.loading = false))
      .subscribe(() => this.loadVoteKey()); 
  }

  importVoteKey() {
    console.log("importVoteKey");
  }
}
