import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, of, tap } from 'rxjs';
import { RegisterProxyService } from './register-proxy-service';

@Injectable({
  providedIn: 'root',
})
export class VoteKeyService {
  private hasVoteKeySubject = new BehaviorSubject<boolean>(false);
  hasVoteKey$ = this.hasVoteKeySubject.asObservable();

  constructor(private registerProxyService: RegisterProxyService) {}
}
