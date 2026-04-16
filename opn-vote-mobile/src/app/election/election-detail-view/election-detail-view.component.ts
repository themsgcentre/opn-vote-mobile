import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonContent } from '@ionic/angular/standalone';
import { filter, map, Observable, of, switchMap } from 'rxjs';
import { TranslationService } from '../../i18n/translation.service';
import { ElectionInformation } from 'src/app/interfaces/election';
import { ElectionService } from 'src/app/services/election-service';
import { ElectionDetailComponent } from '../election-detail/election-detail.component';

@Component({
  selector: 'app-election-detail-view',
  templateUrl: './election-detail-view.component.html',
  styleUrls: ['./election-detail-view.component.scss'],
  imports: [ElectionDetailComponent, CommonModule, IonContent],
})
export class ElectionDetailViewComponent implements OnInit {
  election$: Observable<ElectionInformation | null> = of(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private electionService: ElectionService,
    private alertController: AlertController,
    private translation: TranslationService,
  ) {}

  ngOnInit(): void {
    this.election$ = this.route.paramMap.pipe(
      map((paramMap) => Number(paramMap.get('id'))),
      filter((id) => !isNaN(id)),
      switchMap((id) => this.electionService.getElectionInformation(id)),
    );
  }

  async onParticipateClicked(): Promise<void> {
    const electionIdParam = this.route.snapshot.paramMap.get('id');
    const electionId = Number(electionIdParam);

    if (!Number.isSafeInteger(electionId) || electionId < 0 || electionIdParam === null) {
      await this.presentAlert(
        this.translation.translate('common.error'),
        this.translation.translate('electionDetailView.invalidElectionId'),
      );
      return;
    }

    void this.router.navigate(['/election/register', electionId]);
  }

  private async presentAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [{ text: this.translation.translate('common.ok'), role: 'cancel' }],
    });
    await alert.present();
  }
}
