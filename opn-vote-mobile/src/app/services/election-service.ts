import { Injectable } from '@angular/core';
import { ElectionProxyService } from './election-proxy-service';
import { ElectionInformation } from '../interfaces/election';
import { map, Observable } from 'rxjs';
import { ElectionDTO } from '../interfaces/election-dto';
import { mapElectionInformation } from '../mappers/election-mapper';
import { Question } from '../interfaces/question';

@Injectable({
  providedIn: 'root',
})
export class ElectionService {
  constructor(private electionProxyService: ElectionProxyService) {}

  getElectionInformation(id: number): Observable<ElectionInformation | null> {
    return this.electionProxyService.getElectionById(id).pipe(
      map((dto: ElectionDTO | null) => (dto ? mapElectionInformation(dto) : null))
    );
  }

  getAllElectionInformations(): Observable<ElectionInformation[]> {
    return this.electionProxyService.getElections().pipe(
      map((dtos: ElectionDTO[]) => dtos.map(mapElectionInformation))
    );
  }

  getElection(id: number): Observable<ElectionDTO | null> {
    return this.electionProxyService.getElectionById(id);
  }

  getE(id: number): Observable<string> {
    return this.electionProxyService.getElectionById(id).pipe(
      map((dto: ElectionDTO | null) => dto?.registerPublicKeyE || '')
    );
  }

  getN(id: number): Observable<string> {
    return this.electionProxyService.getElectionById(id).pipe(
      map((dto: ElectionDTO | null) => dto?.registerPublicKeyN || '')
    );
  }

  getPublicKey(id: number): Observable<string | undefined> {
    return this.electionProxyService.getElectionById(id).pipe(
      map((dto: ElectionDTO | null) => dto?.publicKey)
    );
  }

  loadQuestions(id: number): Observable<Question[]> {
    return this.electionProxyService.getElectionById(id).pipe(
      map((dto: ElectionDTO | null) => {
        if (!dto) return [];

        const blob = JSON.parse(dto.descriptionBlob);
        const questions = blob.questions || [];

        return questions.map((q: any, index: number): Question => ({
          key: index,
          text: q.text,
          imageUrl: q.imageUrl
        }));
      })
    );
  }
}
