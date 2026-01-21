import { Component, OnInit } from '@angular/core';
import { MasterkeySetupComponent } from "src/app/credentials/masterkey-setup/masterkey-setup.component";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  imports: [MasterkeySetupComponent],
})
export class RegistrationComponent  implements OnInit {

  hasMasterKey: boolean = false;

  constructor() { }

  ngOnInit() {}

}
