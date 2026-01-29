import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MasterKeyService {
  createNewMasterKey(): Observable<void> {
    return of();
  }

  getMasterKey(): Observable<string | null> {
    return of(null);
  }
}
