import { Injectable } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VoteKeyService {

  private voteKey: string | undefined = undefined;

  getVoteKey(electionId: number): Observable<string | undefined> {
    return of(this.voteKey).pipe(delay(800));
  }

  setVoteKey(key: string): Observable<void> {
    return of(void 0).pipe(
      delay(800),          
      tap(() => (this.voteKey = key))
    );
  }
}
