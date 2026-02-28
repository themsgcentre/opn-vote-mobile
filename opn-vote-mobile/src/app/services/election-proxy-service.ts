import { Injectable } from '@angular/core';
import { ElectionDTO } from '../interfaces/election-dto';
import { from, map, Observable } from 'rxjs';
import { GET_ELECTION } from '../queries/election.queries';
import { graphClient } from '../apollo.config';
import { parseElectionDTO } from '../mappers/election-dto.mapper';
import { GetElectionResponse } from '../interfaces/get-election-response';

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
      //catchError(() => of(null))
    );
  }
}

