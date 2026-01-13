import { Injectable } from '@angular/core';
import { ElectionDTO } from '../interfaces/election-dto';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ElectionService {
  // TODO: Add add methods to only get open elections, finished ones, etc.
  getOpenElections(): Observable<ElectionDTO[]> { //TODO: replace with call to proxy service -> backend
    return of(this.getDummyElections())
  }

  getElectionById(id: number): Observable<ElectionDTO | undefined> {
    const election = this.getDummyElections().find((election) => election.id === id);
    return of(election);
  }

  // TODO: Remove once request to backend works
  private getDummyElections(): ElectionDTO[] {
    var elections = [];
    for(var i = 1; i < 11; i++) {
      elections.push({
        id: i,
        title: 'Titel ' + i,
        category: 'Test Category',
        imageUrl: undefined,
        country: 'Deutschland',
        endDate: this.addDays(new Date(), i * 10),
        numberOfVotes: i*200
      } as ElectionDTO)
    }
    return elections;
  }

  private addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
}

