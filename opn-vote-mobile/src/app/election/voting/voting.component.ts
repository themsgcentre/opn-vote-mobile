import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ElectionInformation } from 'src/app/interfaces/election';
import { BallotService } from 'src/app/services/ballot-service';
import { ElectionService } from 'src/app/services/election-service';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss'],
})
export class VotingComponent  implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private electionService: ElectionService,
    private ballotService: BallotService,
  ) { }

  election: Observable<ElectionInformation | null> = new Observable();
  error: string | null = null;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const electionId = idParam ? Number(idParam) : NaN;
    console.log("VotingComponent initialized with electionId", electionId);

    if(!isNaN(electionId)) {
      console.log("Loading election with id", electionId);
      this.election = this.electionService.getElectionInformation(electionId)
      
    }
    else {
      this.error = "Ungültige Wahl-ID";
    }
  }

}
