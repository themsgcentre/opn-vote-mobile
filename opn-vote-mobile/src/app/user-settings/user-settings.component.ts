import { Component, OnInit } from '@angular/core';
import { MasterKeyManagementComponent } from "../credentials/master-key-management/master-key-management.component";
import { ProviderPickerComponent } from "../provider-picker/provider-picker.component";

type InfoPopupType = 'masterkey' | 'provider' | null;
@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  imports: [MasterKeyManagementComponent, ProviderPickerComponent],
})
export class UserSettingsComponent {
  activeInfoPopup: InfoPopupType = null;

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
