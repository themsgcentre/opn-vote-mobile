import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MasterkeyOptionsComponent } from "src/app/credentials/masterkey-options/masterkey-options.component";
import { ElectionService } from 'src/app/services/election-service';
import { MasterkeyService } from 'src/app/services/masterkey-service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  imports: [MasterkeyOptionsComponent, AsyncPipe],
})
export class RegistrationComponent implements OnInit {

  masterKey$: Observable<string | null> = new Observable<string | null>();
  validElection$ = new Observable<boolean>();
  electionId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private masterKeyService: MasterkeyService,
    private electionService: ElectionService
  ) { }

  ngOnInit(): void {
    //this.masterKey$ = this.masterKeyService.getMasterkey();
    this.masterKey$ = of(null); // Simulate missing master key for testing
    this.electionId = this.route.snapshot.params['electionId'];
    if (this.electionId !== null) {
      this.validElection$ = this.electionService.getElectionById(this.electionId).pipe(
        map(election => election !== undefined && election !== null)
      );
    }
  }

  onImportMasterKey() {
    console.log("Import Master Key clicked");
  }
  onCreateMasterKey() {
    this.masterKeyService.createNewMasterkey();
    this.masterKey$ = of('test-master-key');
  }
}
