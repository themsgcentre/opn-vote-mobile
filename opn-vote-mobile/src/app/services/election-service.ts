import { Injectable } from '@angular/core';
import { ElectionProxyService } from './election-proxy-service';
import { Election } from '../interfaces/election';
import { map, Observable } from 'rxjs';
import { ElectionDTO } from '../interfaces/election-dto';
import { mapElection } from '../mappers/election-mapper';

@Injectable({
  providedIn: 'root',
})
export class ElectionService {
  constructor(private electionProxyService: ElectionProxyService) {}

  getElectionById(id: number): Observable<Election | null> {
    return this.electionProxyService.getElectionById(id).pipe(
      map((dto: ElectionDTO | null) => (dto ? mapElection(dto) : null))
    );
  }

  getAllElections(): Observable<Election[]> {
    return this.electionProxyService.getElections().pipe(
      map((dtos: ElectionDTO[]) => dtos.map(mapElection))
    );
  }
}
