import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PetitionDTO } from 'src/app/interfaces/petition-dto';
import { PetitionOverviewComponent } from "../petition-overview/petition-overview.component";

@Component({
  selector: 'app-petition-list',
  templateUrl: './petition-list.component.html',
  styleUrls: ['./petition-list.component.scss'],
  imports: [PetitionOverviewComponent],
})
export class PetitionListComponent {
  @Input() petitions: PetitionDTO[] = [];
  @Output() petitionClicked: EventEmitter<number> = new EventEmitter<number>();
}
