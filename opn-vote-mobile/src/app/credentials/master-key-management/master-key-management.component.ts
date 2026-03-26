import { Component, OnInit } from '@angular/core';
import { MasterKeySetupComponent } from "../master-key-setup/master-key-setup.component";
import { MasterKeyService } from 'src/app/services/master-key-service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
type InfoPopupType = 'masterkey' | 'provider' | null;

@Component({
  selector: 'app-master-key-management',
  templateUrl: './master-key-management.component.html',
  styleUrls: ['./master-key-management.component.scss'],
  imports: [AsyncPipe],
})
export class MasterKeyManagementComponent implements OnInit {

  constructor(
    private masterKeyService: MasterKeyService
  ) {}
  hasMasterKey$: Observable<boolean> = new Observable<boolean>(); 
  activeInfoPopup: InfoPopupType = null;

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
    this.masterKeyService
      .deleteMasterKey()
      .subscribe(() => this.refresh());
  }

  openInfoPopup(type: InfoPopupType) {
    this.activeInfoPopup = type;
  }

  closeInfoPopup() {
    this.activeInfoPopup = null;
  }

  get popupTitle(): string {
    if (this.activeInfoPopup === 'masterkey') {
      return 'Masterkey';
    }

    if (this.activeInfoPopup === 'provider') {
      return 'Authorization Provider';
    }

    return '';
  }

  get popupText(): string {
    if (this.activeInfoPopup === 'masterkey') {
      return 'Der Masterkey dient zur sicheren Verwaltung Ihrer Identität und wird für sensible Aktionen innerhalb der App benötigt.';
    }

    if (this.activeInfoPopup === 'provider') {
      return 'Hier können später externe Authentifizierungsanbieter zur Identifikation und Autorisierung ausgewählt werden.';
    }

    return '';
  }
}
