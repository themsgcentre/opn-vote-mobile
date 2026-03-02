import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, filter, finalize, Observable, shareReplay, take, tap } from 'rxjs';
import { VoteKeyService } from 'src/app/services/vote-key-service';

@Component({
  selector: 'app-vote-key-setup',
  templateUrl: './vote-key-setup.component.html',
  styleUrls: ['./vote-key-setup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class VoteKeySetupComponent {
  @Output() createClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() imported: EventEmitter<string> = new EventEmitter<string>();

  createVoteKey() {
    this.createClicked.emit();
  }

  importVoteKey() {
    console.log("importVoteKey");
  }
}
