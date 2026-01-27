import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-masterkey-setup',
  templateUrl: './masterkey-setup.component.html',
  styleUrls: ['./masterkey-setup.component.scss'],
})
export class MasterkeySetupComponent {

  @Input() canSkip: boolean = false;

  createMasterKeyClicked() {
    console.log("Create Master Key clicked");
  }

  importMasterKeyClicked() {
    //TODO: Implement later
    console.log("Import Master Key clicked");
  }
}
