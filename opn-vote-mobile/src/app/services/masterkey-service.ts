import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MasterkeyService {
  createNewMasterkey(): Observable<void> {
    return of();
  }

  getMasterkey(): Observable<string | null> {
    return of(null);
  }
}
