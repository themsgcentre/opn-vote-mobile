import { Injectable } from '@angular/core';
import { combineLatest, forkJoin, from, map, Observable, of, switchMap, take, throwError } from 'rxjs';
import { RegisterProxyService } from './register-proxy-service';
import { MasterKeyService } from './master-key-service';
import { Ballot } from '../voting-system/ballot';
import { RSA_BIT_LENGTH } from '../utils/constants';
import { TokenService } from './token-service';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { VoterCredentials } from '../interfaces/voter-credentials';
import { MasterKey } from '../voting-system/masterkey';

@Injectable({
  providedIn: 'root',
})
export class BallotService {
  private readonly BALLOT_INDEX_KEY = 'opnvote_ballot_index_v2';

  private keyFor(electionId: number) {
    return `${this.BALLOT_INDEX_KEY}_${electionId}`;
  }

  constructor(
    private masterKeyService: MasterKeyService,
    private registerProxyService: RegisterProxyService,
    private tokenService: TokenService
  ) {}

  hasBallot(electionId: number): Observable<boolean> {
    return combineLatest([
      from(this.loadBallotInternal(electionId)),
      this.masterKeyService.getMasterKey(),
    ]).pipe(
      switchMap(([ballot, masterKey]) => {
        if (!ballot || !masterKey) {
          return of(false);
        }
        return from(this.ballotMatchesMasterKey(electionId, ballot, masterKey));
      })
    );
  }

  listElectionIdsWithValidBallot(): Observable<number[]> {
    return from(this.loadBallotIndex()).pipe(
      switchMap((ids) => {
        if (ids.length === 0) {
          return of([]);
        }
        return forkJoin(
          ids.map((electionId) =>
            this.hasBallot(electionId).pipe(
              map((has) => ({ electionId, has })),
            ),
          ),
        ).pipe(
          map((pairs) => pairs.filter((p) => p.has).map((p) => p.electionId)),
        );
      }),
    );
  }

  loadBallot(electionId: number): Observable<Ballot | null> {
    return from(this.loadBallotInternal(electionId));
  }

  importBallot(ballot: Ballot): Observable<void> {
    return this.masterKeyService.getMasterKey().pipe(
      take(1),
      switchMap((mk) => {
        if (!mk) {
          return throwError(() => new Error('NO_MASTERKEY'));
        }
        return from(this.ballotMatchesMasterKey(ballot.electionId, ballot, mk)).pipe(
          switchMap((matches) => {
            if (!matches) {
              return throwError(() => new Error('BALLOT_MASTER_MISMATCH'));
            }
            return from(this.saveBallotInternal(ballot));
          })
        );
      })
    );
  }

  createBallot(electionId: number, jwt: string, n: string, e: string): Observable<Ballot> {
    return this.masterKeyService.getMasterKey().pipe(
      switchMap((mk) => {
        if (!mk) return throwError(() => new Error('NO_MASTERKEY'));

        const rsaParams = {
          N: BigInt(n),
          e: BigInt(e),
          NbitLength: RSA_BIT_LENGTH,
        };

        // derive token
        return from(
          this.tokenService.deriveElectionUnblindedToken(electionId, mk.masterToken)
        ).pipe(
          // derive R 
          switchMap((unblindedElectionToken) =>
            from(
              this.tokenService.deriveElectionR(
                electionId,
                mk.masterR,
                unblindedElectionToken,
                rsaParams
              )
            ).pipe(
              // call register and build ballot
              switchMap((electionR) => {
                const blindedElectionToken = this.tokenService.blindToken(
                  unblindedElectionToken,
                  electionR,
                  rsaParams
                );

                return this.registerProxyService
                  .getBlindedSignature(jwt, blindedElectionToken)
                  .pipe(
                    map((blindedSig) => {
                      const unblindedSig = this.registerProxyService.unblindSignature(
                        blindedSig,
                        electionR,
                        rsaParams
                      );

                      const ballot: Ballot = {
                        electionId: electionId,
                        unblindedElectionTokenHex: unblindedElectionToken.hexString,
                        unblindedSignatureHex: unblindedSig.hexString,
                      };

                      return ballot;
                    }),
                    switchMap((ballot) =>
                      from(this.saveBallotInternal(ballot)).pipe(map(() => ballot))
                    )
                  );
              })
            )
          )
        );
      })
    );
  }

  getCredentials(electionId: number): Observable<VoterCredentials | null> {
    return combineLatest([
      this.loadBallot(electionId),
      this.masterKeyService.getMasterKey(),
    ]).pipe(
      switchMap(([ballot, masterKey]) => {
        if (!ballot || !masterKey) {
          return of(null);
        }

        return from(this.ballotMatchesMasterKey(electionId, ballot, masterKey)).pipe(
          switchMap((matches) => {
            if (!matches) {
              return of(null);
            }
            return from(
              this.registerProxyService.createVoterCredentialsFromStoredData(
                electionId,
                ballot,
                masterKey.masterToken
              )
            );
          })
        );
      })
    );
  }

  async ballotMatchesMasterKey(
    electionId: number,
    ballot: Ballot,
    masterKey: MasterKey
  ): Promise<boolean> {
    const derived = await this.tokenService.deriveElectionUnblindedToken(
      electionId,
      masterKey.masterToken
    );
    return (
      derived.hexString.toLowerCase() === ballot.unblindedElectionTokenHex.toLowerCase()
    );
  }

  private async saveBallotInternal(ballot: Ballot): Promise<void> {
    const ballotIndex = await this.loadBallotIndex();
    if (!ballotIndex.includes(ballot.electionId)) {
      ballotIndex.push(ballot.electionId);
      await this.saveBallotIndex(ballotIndex);
    }

    await SecureStoragePlugin.set({
      key: this.keyFor(ballot.electionId),
      value: JSON.stringify(ballot),
    });
  }

  private async loadBallotInternal(electionId: number): Promise<Ballot | null> {
    try {
      const res = await SecureStoragePlugin.get({ key: this.keyFor(electionId) });
      if (!res.value) return null;
      return JSON.parse(res.value) as Ballot;
    } catch {
      return null;
    }
  }

  private async loadBallotIndex(): Promise<number[]> {
    try {
      const res = await SecureStoragePlugin.get({ key: this.BALLOT_INDEX_KEY });
      if (!res.value) return [];

      const parsed = JSON.parse(res.value);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter((id): id is number => Number.isInteger(id));
    } catch {
      return [];
    }
  }

  private async saveBallotIndex(index: number[]): Promise<void> {
    await SecureStoragePlugin.set({
      key: this.BALLOT_INDEX_KEY,
      value: JSON.stringify(index),
    });
  }
}
