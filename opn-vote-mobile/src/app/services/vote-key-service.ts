import { Injectable } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VoteKeyService {

  private voteKey: string | null = null;

  getVoteKey(electionId: number): Observable<string | null> {
    throw new Error("Not implemented");
  }

  createVoteKey(electionId: number): Observable<void> {
    throw new Error("Not implemented");
  }
}
