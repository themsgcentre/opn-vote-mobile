import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonContent } from '@ionic/angular/standalone';
import {
  BehaviorSubject,
  Observable,
  concat,
  filter,
  firstValueFrom,
  from,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';
import {
  MasterKeyManagementComponent,
  MasterKeyPanelState,
} from '../../credentials/master-key-management/master-key-management.component';
import { formatDate } from '../../formatting/date-formatting';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslationService } from '../../i18n/translation.service';
import { Ballot } from '../../models/ballot';
import { MasterKey } from '../../models/masterkey';
import { BallotExportComponent } from '../../import-export/ballot-export/ballot-export.component';
import { BallotImportComponent } from '../../import-export/ballot-import/ballot-import.component';
import { ProviderPickerComponent } from '../../provider-picker/provider-picker.component';
import { QrScanDialogComponent } from '../../import-export/qr-scan-dialog/qr-scan-dialog.component';
import { PdfType } from '../../import-export/pdf-type';
import { BallotService } from '../../services/ballot-service';
import { FileSaveService } from '../../services/file-save-service';
import { ImportService } from '../../services/import-service';
import { MasterKeyService } from '../../services/master-key-service';
import { PdfService } from '../../services/pdf-service';
import { QrCodeService } from '../../services/qr-code-service';
import { VoteParticipationStorageService } from '../../services/vote-participation-storage.service';
import { MessageDialogComponent } from 'src/app/reusables/message-dialog/message-dialog.component';
import { QuestionDialogComponent } from 'src/app/reusables/question-dialog/question-dialog.component';
import { ImportDialogComponent } from 'src/app/reusables/import-dialog/import-dialog.component';

type InfoPopupType = 'masterkey' | 'provider' | 'ballot' | null;

@Component({
  selector: 'app-user-settings',
  standalone: true,
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  imports: [
    AsyncPipe,
    IonContent,
    MasterKeyManagementComponent,
    ProviderPickerComponent,
    ImportDialogComponent,
    QrScanDialogComponent,
    MessageDialogComponent,
    QuestionDialogComponent,
    BallotImportComponent,
    BallotExportComponent,
    TranslatePipe,
  ],
})
export class UserSettingsComponent {
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  activeInfoPopup: InfoPopupType = null;

  readonly masterKeyPanelState$: Observable<MasterKeyPanelState> = this.refresh$.pipe(
    switchMap(() =>
      concat(
        of<MasterKeyPanelState>('loading'),
        this.masterKeyService.hasMasterKey().pipe(
          map((has): MasterKeyPanelState => (has ? 'present' : 'none')),
        ),
      ),
    ),
  );

  masterKeyImportError: string | null = null;
  masterKeyImportDialogOpened = false;
  masterKeyQrScanOpened = false;
  masterKeyImportSuccess = false;
  masterKeyDeleteDialogOpen = false;
  masterKeyExportConfirmDialogOpen = false;

  readonly masterKeyExportSecurityQuestion = this.translation.translate(
    'masterKey.export.securityQuestion',
  );

  ballotImportError: string | null = null;
  ballotImportDialogOpened = false;
  ballotQrScanOpened = false;
  ballotImportFeedbackOpen = false;
  ballotImportFeedbackTitle = '';
  ballotImportFeedbackMessage = '';

  constructor(
    private router: Router,
    private masterKeyService: MasterKeyService,
    private ballotService: BallotService,
    private qrCodeService: QrCodeService,
    private pdfService: PdfService,
    private fileSaveService: FileSaveService,
    private importService: ImportService,
    private voteParticipationStorage: VoteParticipationStorageService,
    private alertController: AlertController,
    private translation: TranslationService,
  ) {}

  openInfoPopup(type: InfoPopupType): void {
    this.activeInfoPopup = type;
  }

  closeInfoPopup(): void {
    this.activeInfoPopup = null;
  }

  get popupTitle(): string {
    if (this.activeInfoPopup === 'masterkey') {
      return this.translation.translate('masterKey.title');
    }
    if (this.activeInfoPopup === 'provider') {
      return this.translation.translate('userSettings.providerPopup.title');
    }
    if (this.activeInfoPopup === 'ballot') {
      return this.translation.translate('userSettings.ballotPopup.title');
    }
    return '';
  }

  get popupText(): string {
    if (this.activeInfoPopup === 'masterkey') {
      return this.translation.translate('masterKey.popup.text');
    }
    if (this.activeInfoPopup === 'provider') {
      return this.translation.translate('userSettings.providerPopup.text');
    }
    if (this.activeInfoPopup === 'ballot') {
      return this.translation.translate('userSettings.ballotPopup.text');
    }
    return '';
  }

  onCreateMasterKey(): void {
    this.masterKeyService.createNewMasterKey().subscribe({
      next: () => this.triggerMasterKeyRefresh(),
      error: () => {
        this.masterKeyImportError = this.translation.translate('masterKey.importFlow.createError');
      },
    });
  }

  onMasterKeyExportClicked(): void {
    this.masterKeyExportConfirmDialogOpen = true;
  }

  onMasterKeyExportSecurityNo(): void {
    this.masterKeyExportConfirmDialogOpen = false;
  }

  onMasterKeyExportSecurityYes(): void {
    this.masterKeyExportConfirmDialogOpen = false;
    this.runMasterKeyPdfExport();
  }

  onOpenMasterKeyImport(): void {
    this.masterKeyImportError = null;
    this.masterKeyImportDialogOpened = true;
  }

  masterKeyImportViaScan(): void {
    this.masterKeyImportDialogOpened = false;
    this.masterKeyImportError = null;
    this.masterKeyQrScanOpened = true;
  }

  onMasterKeyImportPdfFromDialog(file: File): void {
    this.masterKeyImportDialogOpened = false;
    this.masterKeyImportError = null;
    void this.handleMasterKeyPdfFile(file);
  }

  async handleMasterKeyPdfFile(file: File): Promise<void> {
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      this.masterKeyImportError = this.translation.translate('masterKey.importFlow.invalidPdf');
      return;
    }

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const qrString = await this.pdfService.extractQrImportStringFromPdf(bytes);
      if (!qrString) {
        this.masterKeyImportError = this.translation.translate(
          'masterKey.importFlow.missingPdfData',
        );
        return;
      }
      this.processMasterKeyImportPayload(qrString);
    } catch (e) {
      this.masterKeyImportError =
        e instanceof Error
          ? e.message
          : this.translation.translate('masterKey.importFlow.unreadablePdf');
    }
  }

  onMasterKeyQrScanCancel(): void {
    this.masterKeyQrScanOpened = false;
  }

  onMasterKeyQrScanSuccess(raw: string): void {
    this.masterKeyQrScanOpened = false;
    this.processMasterKeyImportPayload(raw);
  }

  onConfirmDeleteMasterKey(): void {
    this.ballotImportError = null;
    this.masterKeyService.deleteMasterKey().subscribe(() => {
      this.triggerMasterKeyRefresh();
      this.masterKeyDeleteDialogOpen = false;
    });
  }

  closeMasterKeyImportSuccess(): void {
    this.masterKeyImportSuccess = false;
  }

  onOpenBallotImport(): void {
    this.ballotImportError = null;
    this.ballotImportDialogOpened = true;
  }

  ballotImportViaScan(): void {
    this.ballotImportDialogOpened = false;
    this.ballotImportError = null;
    this.ballotQrScanOpened = true;
  }

  onBallotImportPdfFromDialog(file: File): void {
    this.ballotImportDialogOpened = false;
    this.ballotImportError = null;
    void this.processBallotPdfBatch([file]);
  }

  onBallotQrScanCancel(): void {
    this.ballotQrScanOpened = false;
  }

  onBallotQrScanSuccess(raw: string): void {
    this.ballotQrScanOpened = false;
    this.processBallotImportPayload(raw);
  }

  closeBallotImportFeedback(): void {
    this.ballotImportFeedbackOpen = false;
  }

  private triggerMasterKeyRefresh(): void {
    this.refresh$.next();
  }

  private async presentMasterKeyExportError(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translation.translate('common.error'),
      message: this.translation.translate('masterKey.export.errorMessage'),
      buttons: [{ text: this.translation.translate('common.ok'), role: 'cancel' }],
    });
    await alert.present();
  }

  private runMasterKeyPdfExport(): void {
    this.masterKeyService
      .getMasterKey()
      .pipe(
        filter((masterKey): masterKey is MasterKey => !!masterKey),
        switchMap((masterKey) => {
          const qrCodeString = JSON.stringify({
            type: 'master-key',
            version: 1,
            data: masterKey,
          });
          return from(this.qrCodeService.generateDataUrl(qrCodeString)).pipe(
            map((qrCodeDataUrl) => ({ qrCodeString, qrCodeDataUrl })),
          );
        }),
        switchMap(({ qrCodeString, qrCodeDataUrl }) =>
          from(
            this.pdfService.createPdf({
              qrCodeString,
              qrCodeDataUrl,
              downloadHeadline: this.translation.translate('masterKey.export.titleShort'),
              pdfType: PdfType.VOTING_KEY,
            }),
          ),
        ),
        switchMap((pdfBytes) => {
          const formattedDate = formatDate(new Date());
          return from(
            this.fileSaveService.savePdf({
              fileName: this.translation.translate('masterKey.export.fileName', {
                date: formattedDate,
              }),
              pdfBytes,
            }),
          );
        }),
      )
      .subscribe({
        error: () => {
          void this.presentMasterKeyExportError();
        },
      });
  }

  private processMasterKeyImportPayload(raw: string): void {
    try {
      const payload = this.importService.parseQrString(raw);
      if (!this.importService.isMasterKeyPayload(payload)) {
        this.masterKeyImportError = this.translation.translate(
          'masterKey.importFlow.invalidPayload',
        );
        return;
      }
      this.masterKeyService
        .importMasterKey(payload.data)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.masterKeyImportSuccess = true;
            this.triggerMasterKeyRefresh();
          },
          error: () => {
            this.masterKeyImportError = this.translation.translate(
              'masterKey.importFlow.saveError',
            );
          },
        });
    } catch (e) {
      this.masterKeyImportError =
        e instanceof Error
          ? e.message
          : this.translation.translate('masterKey.importFlow.unreadableData');
    }
  }

  private mapBallotImportError(err: unknown): string {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'BALLOT_MASTER_MISMATCH') {
      return this.translation.translate('ballotImportFlow.mismatch');
    }
    if (msg === 'NO_MASTERKEY') {
      return this.translation.translate('ballotImportFlow.noMasterKey');
    }
    return this.translation.translate('ballotImportFlow.saveError');
  }

  private async tryParseBallotFromPdf(
    file: File,
  ): Promise<{ ballot: Ballot } | { error: string }> {
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return { error: this.translation.translate('ballotImportFlow.notPdf') };
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const qrString = await this.pdfService.extractQrImportStringFromPdf(bytes);
      if (!qrString) {
        return { error: this.translation.translate('ballotImportFlow.noPdfData') };
      }
      const payload = this.importService.parseQrString(qrString);
      if (!this.importService.isBallotPayload(payload)) {
        return { error: this.translation.translate('ballotImportFlow.invalidContent') };
      }
      return { ballot: payload.data };
    } catch (e) {
      return {
        error:
          e instanceof Error ? e.message : this.translation.translate('ballotImportFlow.unreadablePdf'),
      };
    }
  }

  private async processBallotPdfBatch(files: File[]): Promise<void> {
    if (files.length === 0) {
      return;
    }

    const failures: string[] = [];
    let okCount = 0;
    let importedElectionId: number | null = null;

    for (const file of files) {
      const parsed = await this.tryParseBallotFromPdf(file);
      if ('error' in parsed) {
        failures.push(`${file.name}: ${parsed.error}`);
        continue;
      }
      try {
        await firstValueFrom(this.ballotService.importBallot(parsed.ballot).pipe(take(1)));
        void this.voteParticipationStorage.recordRegistered(parsed.ballot.electionId);
        okCount += 1;
        importedElectionId = parsed.ballot.electionId;
      } catch (err) {
        failures.push(`${file.name}: ${this.mapBallotImportError(err)}`);
      }
    }

    const total = files.length;
    if (failures.length === 0) {
      if (okCount === 1 && importedElectionId !== null) {
        await this.navigateToVoting(importedElectionId);
        return;
      }

      this.ballotImportError = null;
      this.ballotImportFeedbackTitle = this.translation.translate('ballotImportFlow.title');
      this.ballotImportFeedbackMessage =
        okCount === 1
          ? this.translation.translate('ballotImportFlow.successSingle')
          : this.translation.translate('ballotImportFlow.successMultiple', { count: okCount });
      this.ballotImportFeedbackOpen = true;
      return;
    }

    if (okCount === 0) {
      this.ballotImportFeedbackOpen = false;
      this.ballotImportError =
        failures.length === 1
          ? failures[0]
          : this.translation.translate('ballotImportFlow.noneSuccessful', {
              total,
              failures: failures.join('\n'),
            });
      return;
    }

    this.ballotImportError = this.translation.translate('ballotImportFlow.partialError', {
      failedCount: failures.length,
      total,
      failures: failures.join('\n'),
    });
    this.ballotImportFeedbackTitle = this.translation.translate('ballotImportFlow.title');
    this.ballotImportFeedbackMessage = this.translation.translate(
      'ballotImportFlow.partialSuccess',
      { count: okCount },
    );
    this.ballotImportFeedbackOpen = true;
  }

  private processBallotImportPayload(raw: string): void {
    try {
      const payload = this.importService.parseQrString(raw);
      if (!this.importService.isBallotPayload(payload)) {
        this.ballotImportError = this.translation.translate('ballotImportFlow.invalidPayload');
        return;
      }
      this.ballotService
        .importBallot(payload.data)
        .pipe(take(1))
        .subscribe({
          next: async () => {
            this.ballotImportError = null;
            void this.voteParticipationStorage.recordRegistered(payload.data.electionId);
            await this.navigateToVoting(payload.data.electionId);
          },
          error: (err) => {
            this.ballotImportError = this.mapBallotImportError(err);
          },
        });
    } catch (e) {
      this.ballotImportError =
        e instanceof Error
          ? e.message
          : this.translation.translate('ballotImportFlow.unreadableData');
    }
  }

  private async navigateToVoting(electionId: number): Promise<void> {
    this.ballotImportDialogOpened = false;
    this.ballotQrScanOpened = false;
    this.ballotImportFeedbackOpen = false;
    await this.router.navigate(['/election/vote', electionId]);
  }
}
