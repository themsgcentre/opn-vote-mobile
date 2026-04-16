import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';
import {
  combineLatest,
  filter,
  finalize,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';
import { formatDate } from '../formatting/date-formatting';
import { UrlPaths } from '../globals/url';
import { TranslationService } from '../i18n/translation.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { ElectionInformation } from '../interfaces/election';
import { QuestionDialogComponent } from '../question-dialog/question-dialog.component';
import { ElectionPdfInformation } from '../qr-code/election-pdf-info';
import { PdfType } from '../qr-code/pdf-type';
import { BallotService } from '../services/ballot-service';
import { ElectionService } from '../services/election-service';
import { FileSaveService } from '../services/file-save-service';
import { PdfService } from '../services/pdf-service';
import { QrCodeService } from '../services/qr-code-service';
import { Ballot } from '../voting-system/ballot';

export interface BallotExportRow {
  electionId: number;
  title: string;
}

@Component({
  selector: 'app-ballot-export',
  standalone: true,
  imports: [AsyncPipe, QuestionDialogComponent, TranslatePipe],
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
  readonly translation = inject(TranslationService);

  exportingElectionId: number | null = null;
  ballotExportConfirmElectionId: number | null = null;

  readonly ballotExportSecurityQuestion = this.translation.translate(
    'ballotExport.securityQuestion',
  );

  readonly rows$: Observable<BallotExportRow[]> = this.ballotService
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
                    : this.translation.translate('ballotExport.fallbackElectionTitle', {
                        electionId,
                      }),
              })),
            ),
          ),
        );
      }),
    );

  requestBallotPdfExport(electionId: number): void {
    if (this.exportingElectionId !== null || this.ballotExportConfirmElectionId !== null) {
      return;
    }
    this.ballotExportConfirmElectionId = electionId;
  }

  onBallotExportSecurityNo(): void {
    this.ballotExportConfirmElectionId = null;
  }

  onBallotExportSecurityYes(): void {
    const electionId = this.ballotExportConfirmElectionId;
    this.ballotExportConfirmElectionId = null;
    if (electionId != null) {
      this.performBallotPdfExport(electionId);
    }
  }

  private async presentExportError(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translation.translate('common.error'),
      message: this.translation.translate('ballotExport.exportErrorMessage'),
      buttons: [{ text: this.translation.translate('common.ok'), role: 'cancel' }],
    });
    await alert.present();
  }

  private performBallotPdfExport(electionId: number): void {
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
              downloadHeadline: this.translation.translate('ballotExport.titleShort'),
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
