import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterkeyService } from 'src/app/services/masterkey-service';

@Component({
  selector: 'app-masterkey-options',
  templateUrl: './masterkey-options.component.html',
  styleUrls: ['./masterkey-options.component.scss'],
})
export class MasterkeyOptionsComponent implements OnInit {
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
    this.masterKeyService.createNewMasterkey()
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        }
      });
  }
}
