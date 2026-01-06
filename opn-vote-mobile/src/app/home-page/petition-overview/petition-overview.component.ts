import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PetitionDTO } from 'src/app/interfaces/petition-dto';
import { PetitionInfoComponent } from "../petition-info/petition-info.component";
import { PetitionOverviewImageComponent } from "../petition-overview-image/petition-overview-image.component";

@Component({
  selector: 'app-petition-overview',
  templateUrl: './petition-overview.component.html',
  styleUrls: ['./petition-overview.component.scss'],
  imports: [PetitionInfoComponent, PetitionOverviewImageComponent],
})
export class PetitionOverviewComponent implements OnChanges {
  @Input() petition: PetitionDTO | undefined; 
  daysTilEnd: number = 0;

  ngOnChanges(): void {
    const now = new Date();
    if(this.petition && this.petition.endDate) {
      this.daysTilEnd = this.daysBetween(now, this.petition.endDate)
    }
  }

  private daysBetween(date1: Date, date2: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = date2.getTime() - date1.getTime();
    return Math.floor(diffMs / msPerDay);
  }
}
