import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterKeyService } from 'src/app/services/master-key-service';

@Component({
  selector: 'app-master-key-setup',
  templateUrl: './master-key-setup.component.html',
  styleUrls: ['./master-key-setup.component.scss'],
})
export class MasterKeySetupComponent implements OnInit {
  constructor(
    private masterKeyService: MasterKeyService,
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
    this.masterKeyService.createNewMasterKey().subscribe({
      complete: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
    });
  }
}
