import { Injectable } from '@angular/core';
import { ElectionDTO } from '../models/election-dto';
import { catchError, from, map, Observable, of } from 'rxjs';
import { GET_ELECTION, GET_ALL_ELECTIONS, GET_ELECTION_RESULTS } from '../queries/election.queries';
import { graphClient } from '../server/apollo.config';
import { parseElectionDTO } from '../mappers/election-dto.mapper';
import { GetElectionResponse, GetElectionsResponse, GetResultsResponse } from '../models/responses';
import { VotesRecord } from '../models/votes-record';

@Injectable({
  providedIn: 'root',
})
export class ElectionProxyService {
  getElectionById(id: number): Observable<ElectionDTO | null> {
    return from(
      graphClient.query<GetElectionResponse>({
        query: GET_ELECTION,
        variables: { id: String(id) },
        fetchPolicy: 'network-only',
      })
    ).pipe(
      map(res => {
        const raw = res.data?.election;
        return raw ? parseElectionDTO(raw) : null;
      }),
    );
  }

  getElections(): Observable<ElectionDTO[]> {
    return from(
      graphClient.query<GetElectionsResponse>({
        query: GET_ALL_ELECTIONS,
        fetchPolicy: 'network-only',
      })
    ).pipe(
      map(res => {
        const raw = res.data?.elections;
        return raw ? raw.map(parseElectionDTO) : [];
      })
    );
  }

  getResults(id: number): Observable<VotesRecord | null> {
    return from(
      graphClient.query<GetResultsResponse>({
        query: GET_ELECTION_RESULTS,
        variables: { id: String(id) },
        fetchPolicy: 'network-only',
      })
    ).pipe(
      map((res) => {
        const rows = res.data?.electionResultsPublisheds;
        if (!rows?.length) {
          return null;
        }

        const r = rows[0];
        const yes = r.yesVotes ?? [];
        const no = r.noVotes ?? [];
        const inv = r.invalidVotes ?? [];
        const n = Math.min(yes.length, no.length, inv.length);
        if (n === 0) {
          return null;
        }

        const ret: VotesRecord = {};
        for (let i = 0; i < n; i++) {
          ret[i] = {
            yesVotes: Number(yes[i]),
            noVotes: Number(no[i]),
            invalidVotes: Number(inv[i]),
          };
        }

        return ret;
      }),
      catchError(() => of(null)) 
    );
  }
}

