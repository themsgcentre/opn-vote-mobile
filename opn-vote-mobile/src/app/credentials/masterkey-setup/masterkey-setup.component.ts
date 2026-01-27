import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-masterkey-setup',
  templateUrl: './masterkey-setup.component.html',
  styleUrls: ['./masterkey-setup.component.scss'],
})
export class MasterkeySetupComponent  implements OnInit {

  @Input() canSkip: boolean = false;
  
  constructor() { }

  ngOnInit() {}

}
