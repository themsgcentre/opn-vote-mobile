import { Injectable } from '@angular/core';
import { from, map, Observable, switchMap, throwError } from 'rxjs';
import { RegisterProxyService } from './register-proxy-service';
import { MasterKeyService } from './master-key-service';
import { Ballot } from '../voting-system/ballot';
import { ElectionDTO } from '../interfaces/election-dto';
import { RSA_BIT_LENGTH } from '../utils/constants';
import { TokenService } from './token-service';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

@Injectable({
  providedIn: 'root',
})
export class BallotService {
  private keyFor(electionId: number) {
    return `opnvote_ballot_v1_${electionId}`;
  }

  constructor(
    private masterKeyService: MasterKeyService,
    private registerProxyService: RegisterProxyService,
    private tokenService: TokenService
  ) {}

  hasBallot(electionId: number): Observable<boolean> {
    return this.loadBallot(electionId).pipe(map((b) => !!b));
  }

  loadBallot(electionId: number): Observable<Ballot | null> {
    return from(this.loadBallotInternal(electionId));
  }

  deleteBallot(electionId: number): Observable<void> {
    return from(this.deleteBallotInternal(electionId));
  }

  createBallot(jwt: string, election: ElectionDTO): Observable<Ballot> {
    return this.masterKeyService.getMasterKey().pipe(
      switchMap((mk) => {
        if (!mk) return throwError(() => new Error('NO_MASTERKEY'));

        const rsaParams = {
          N: BigInt(election.registerPublicKeyN),
          e: BigInt(election.registerPublicKeyE),
          NbitLength: RSA_BIT_LENGTH,
        };

        // derive token
        return from(
          this.tokenService.deriveElectionUnblindedToken(election.id, mk.masterToken)
        ).pipe(
          // derive R 
          switchMap((unblindedElectionToken) =>
            from(
              this.tokenService.deriveElectionR(
                election.id,
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
                      const unblindedSig = this.tokenService.unblindSignature(
                        blindedSig,
                        electionR,
                        rsaParams
                      );

                      const ballot: Ballot = {
                        electionId: election.id,
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

  private async saveBallotInternal(ballot: Ballot): Promise<void> {
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

  private async deleteBallotInternal(electionId: number): Promise<void> {
    try {
      await SecureStoragePlugin.remove({ key: this.keyFor(electionId) });
    } catch {
    }
  }
}
