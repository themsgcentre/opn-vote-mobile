import { Component, OnInit } from '@angular/core';
import { MasterKeySetupComponent } from "../master-key-setup/master-key-setup.component";
import { MasterKeyService } from 'src/app/services/master-key-service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-master-key-management',
  templateUrl: './master-key-management.component.html',
  styleUrls: ['./master-key-management.component.scss'],
  imports: [MasterKeySetupComponent, AsyncPipe],
})
export class MasterKeyManagementComponent implements OnInit {

  constructor(private masterKeyService: MasterKeyService) {}
  hasMasterKey$: Observable<boolean> = new Observable<boolean>(); 

  ngOnInit() {
    this.refresh();
  }

  private refresh() {
    this.hasMasterKey$ = this.masterKeyService.hasMasterKey();
  }

  onCreateMasterKey() {
    this.masterKeyService.createNewMasterKey().subscribe(() => this.refresh());
  }

  onDeleteMasterKey() {
    this.masterKeyService.deleteMasterKey().subscribe(() => this.refresh());
  }
}
