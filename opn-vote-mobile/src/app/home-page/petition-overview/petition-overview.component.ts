import { Component, Input, OnInit } from '@angular/core';
import { PetitionDTO } from 'src/app/interfaces/petition-dto';

@Component({
  selector: 'app-petition-overview',
  templateUrl: './petition-overview.component.html',
  styleUrls: ['./petition-overview.component.scss'],
})
export class PetitionOverviewComponent {
  @Input() petition: PetitionDTO | undefined;
}
