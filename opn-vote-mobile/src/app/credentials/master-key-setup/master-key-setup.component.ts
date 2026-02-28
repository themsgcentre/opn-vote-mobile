import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterKeyService } from 'src/app/services/master-key-service';

@Component({
  selector: 'app-master-key-setup',
  templateUrl: './master-key-setup.component.html',
  styleUrls: ['./master-key-setup.component.scss'],
})
export class MasterKeySetupComponent {
  @Output() createClicked: EventEmitter<void> = new EventEmitter<void>();
}
