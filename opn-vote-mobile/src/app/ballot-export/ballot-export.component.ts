import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';
import {
  combineLatest,
  filter,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
  take,
  finalize,
} from 'rxjs';
import { BallotService } from '../services/ballot-service';
import { ElectionService } from '../services/election-service';
import { QrCodeService } from '../services/qr-code-service';
import { PdfService } from '../services/pdf-service';
import { FileSaveService } from '../services/file-save-service';
import { Ballot } from '../voting-system/ballot';
import { ElectionInformation } from '../interfaces/election';
import { PdfType } from '../qr-code/pdf-type';
import { ElectionPdfInformation } from '../qr-code/election-pdf-info';
import { formatDate } from '../formatting/date-formatting';
import { UrlPaths } from '../globals/url';

export interface BallotExportRow {
  electionId: number;
  title: string;
}

@Component({
  selector: 'app-ballot-export',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './ballot-export.component.html',
  styleUrls: ['./ballot-export.component.scss'],
})
export class BallotExportComponent {
  private readonly ballotService = inject(BallotService);
  private readonly electionService = inject(ElectionService);
  private readonly qrCodeService = inject(QrCodeService);
  private readonly pdfService = inject(PdfService);
  private readonly fileSaveService = inject(FileSaveService);
  private readonly alertController = inject(AlertController);

  exportingElectionId: number | null = null;

  private async presentExportError(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Fehler',
      message: 'Der Wahlschein konnte nicht exportiert werden.',
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await alert.present();
  }

  rows$: Observable<BallotExportRow[]> = this.ballotService
    .listElectionIdsWithValidBallot()
    .pipe(
      switchMap((ids) => {
        if (ids.length === 0) {
          return of([]);
        }
        return forkJoin(
          ids.map((electionId) =>
            this.electionService.getElectionInformation(electionId).pipe(
              take(1),
              map((info) => ({
                electionId,
                title:
                  info != null && info.title.trim() !== ''
                    ? info.title
                    : `Wahl ${electionId}`,
              })),
            ),
          ),
        );
      }),
    );

  exportBallotPdf(electionId: number): void {
    if (this.exportingElectionId !== null) {
      return;
    }
    this.exportingElectionId = electionId;

    combineLatest([
      this.ballotService.loadBallot(electionId),
      this.electionService.getElectionInformation(electionId),
    ])
      .pipe(
        take(1),
        filter(
          (value): value is [Ballot, ElectionInformation] =>
            value[0] != null && value[1] != null,
        ),
        switchMap(([ballot, electionInfo]) => {
          const qrCodeString = JSON.stringify({
            type: 'ballot',
            version: 1,
            data: ballot,
          });
          const pdfInformation = {
            STARTDATE: formatDate(electionInfo.votingStart),
            ENDDATE: formatDate(electionInfo.votingEnd),
            ELECTION_URL: `${UrlPaths.hostUrl}/election/detail/${electionId}`,
          } as ElectionPdfInformation;

          return from(this.qrCodeService.generateDataUrl(qrCodeString)).pipe(
            map((qrCodeDataUrl: string) => ({
              qrCodeString,
              qrCodeDataUrl,
              pdfInformation,
            })),
          );
        }),
        switchMap(({ qrCodeString, qrCodeDataUrl, pdfInformation }) =>
          from(
            this.pdfService.createPdf({
              qrCodeString,
              qrCodeDataUrl,
              downloadHeadline: 'Wahlschein',
              pdfType: PdfType.ELECTION_PERMIT,
              pdfInformation,
            }),
          ),
        ),
        switchMap((pdfBytes) => {
          const formattedDate = formatDate(new Date());
          return from(
            this.fileSaveService.savePdf({
              fileName: `wahlschein-${electionId}-${formattedDate}`,
              pdfBytes,
            }),
          );
        }),
        finalize(() => {
          this.exportingElectionId = null;
        }),
      )
      .subscribe({
        error: () => {
          void this.presentExportError();
        },
      });
  }
}
