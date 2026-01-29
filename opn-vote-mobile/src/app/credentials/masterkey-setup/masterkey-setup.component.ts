import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterkeyService } from 'src/app/services/masterkey-service';

@Component({
  selector: 'app-masterkey-setup',
  templateUrl: './masterkey-setup.component.html',
  styleUrls: ['./masterkey-setup.component.scss'],
})
export class MasterkeySetupComponent implements OnInit {
  constructor(
    private masterKeyService: MasterkeyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  canSkip: boolean = false;
  electionId?: string;
  returnUrl = '/';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(qp => {
      this.canSkip = (qp.get('canSkip') ?? 'false') === 'true';
      this.returnUrl = qp.get('returnUrl') ?? '/';
      this.electionId = qp.get('electionId') ?? undefined;
    });
  }

  onImportMasterKey() {
      console.log("Import Master Key clicked");
  }
    
  onCreateMasterKey() {
    this.masterKeyService.createNewMasterkey().subscribe({
      complete: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
  });
  }
}
