import { Injectable } from '@angular/core';
import { PetitionDTO } from '../interfaces/petition-dto';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PetitionService {
  // TODO: Add add methods to only get open petitions, finished ones, etc.
  getOpenPetitions(): Observable<PetitionDTO[]> { //TODO: replace with call to proxy service -> backend
    return of(this.getDummyPetitions())
  }

  // TODO: Remove once request to backend works
  private getDummyPetitions(): PetitionDTO[] {
    var petitions = [];
    for(var i = 1; i < 11; i++) {
      petitions.push({
        title: 'Titel ' + i,
        category: 'Test',
        imageUrl: undefined,
        country: 'Deutschland',
        endDate: this.addDays(new Date(), i * 10),
        numberOfVotes: i*200
      } as PetitionDTO)
    }
    return petitions;
  }

  private addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
}

