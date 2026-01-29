import { Injectable } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BallotPaperService {
  private ballotPaper: string | undefined = undefined; //only for simulation purposes
  
    getBallotPaper(electionId: number): Observable<string | undefined> {
      return of(this.ballotPaper).pipe(delay(800));
    }
  
    setBallotPaper(paper: string): Observable<void> {
      return of(void 0).pipe(
        delay(800),          
        tap(() => (this.ballotPaper = paper))
      );
    }
}
