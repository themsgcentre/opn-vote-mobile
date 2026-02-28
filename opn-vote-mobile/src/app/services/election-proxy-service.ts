import { Injectable } from '@angular/core';
import { ElectionDTO } from '../interfaces/election-dto';
import { from, map, Observable } from 'rxjs';
import { GET_ELECTION, GET_ALL_ELECTIONS } from '../queries/election.queries';
import { graphClient } from '../apollo.config';
import { parseElectionDTO } from '../mappers/election-dto.mapper';
import { GetElectionResponse, GetElectionsResponse } from '../interfaces/responses';

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
}

