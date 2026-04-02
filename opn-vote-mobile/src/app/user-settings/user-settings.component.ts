import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  concat,
  filter,
  firstValueFrom,
  from,
  map,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';
import {
  MasterKeyManagementComponent,
  MasterKeyPanelState,
} from '../credentials/master-key-management/master-key-management.component';
import { ProviderPickerComponent } from '../provider-picker/provider-picker.component';
import { MasterKeyService } from '../services/master-key-service';
import { BallotService } from '../services/ballot-service';
import { QrCodeService } from '../services/qr-code-service';
import { PdfService } from '../services/pdf-service';
import { FileSaveService } from '../services/file-save-service';
import { ImportService } from '../services/import-service';
import { MasterKey } from '../voting-system/masterkey';
import { Ballot } from '../voting-system/ballot';
import { PdfType } from '../qr-code/pdf-type';
import { formatDate } from '../formatting/date-formatting';
import { ImportDialogComponent } from '../import-dialog/import-dialog.component';
import { QrScanDialogComponent } from '../qr-scan-dialog/qr-scan-dialog.component';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { QuestionDialogComponent } from '../question-dialog/question-dialog.component';
import { BallotImportComponent } from '../ballot-import/ballot-import.component';
import { VoteParticipationStorageService } from '../services/vote-participation-storage.service';

type InfoPopupType = 'masterkey' | 'provider' | 'ballot' | null;

@Component({
  selector: 'app-user-settings',
  standalone: true,
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  imports: [
    AsyncPipe,
    MasterKeyManagementComponent,
    ProviderPickerComponent,
    ImportDialogComponent,
    QrScanDialogComponent,
    MessageDialogComponent,
    QuestionDialogComponent,
    BallotImportComponent,
  ],
})
export class UserSettingsComponent {
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  activeInfoPopup: InfoPopupType = null;

  masterKeyPanelState$: Observable<MasterKeyPanelState> = this.refresh$.pipe(
    switchMap(() =>
      concat(
        of<MasterKeyPanelState>('loading'),
        this.masterKeyService.hasMasterKey().pipe(
          map((has): MasterKeyPanelState => (has ? 'present' : 'none'))
        )
      )
    )
  );

  masterKeyImportError: string | null = null;
  masterKeyImportDialogOpened = false;
  masterKeyQrScanOpened = false;
  masterKeyImportSuccess = false;
  masterKeyDeleteDialogOpen = false;

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
  ) {}

  openInfoPopup(type: InfoPopupType): void {
    this.activeInfoPopup = type;
  }

  closeInfoPopup(): void {
    this.activeInfoPopup = null;
  }

  get popupTitle(): string {
    if (this.activeInfoPopup === 'masterkey') {
      return 'Masterkey';
    }
    if (this.activeInfoPopup === 'provider') {
      return 'Authorization Provider';
    }
    if (this.activeInfoPopup === 'ballot') {
      return 'Wahlschein';
    }
    return '';
  }

  get popupText(): string {
    if (this.activeInfoPopup === 'masterkey') {
      return 'Der Masterkey dient zur sicheren Verwaltung Ihrer Identität und wird für sensible Aktionen innerhalb der App benötigt.';
    }
    if (this.activeInfoPopup === 'provider') {
      return 'Hier können später externe Authentifizierungsanbieter zur Identifikation und Autorisierung ausgewählt werden.';
    }
    if (this.activeInfoPopup === 'ballot') {
      return 'Importieren Sie Ihre bestehenden Wahlscheine, um diese direkt wiederzuverwenden. Bitte beachten, dass der Wahlschein zu Ihrem Masterschlüssel passen muss. Der Wahlschein berechtigt Sie zur Teilnahme an einer Wahl.';
    }
    return '';
  }

  private triggerMasterKeyRefresh(): void {
    this.refresh$.next();
  }

  onCreateMasterKey(): void {
    this.masterKeyService.createNewMasterKey().subscribe({
      next: () => this.triggerMasterKeyRefresh(),
      error: () => {
        this.masterKeyImportError = 'Master-Key konnte nicht erstellt werden.';
      },
    });
  }

  onExportMasterKey(): void {
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
            map((qrCodeDataUrl) => ({ qrCodeString, qrCodeDataUrl }))
          );
        }),
        switchMap(({ qrCodeString, qrCodeDataUrl }) =>
          from(
            this.pdfService.createPdf({
              qrCodeString,
              qrCodeDataUrl,
              downloadHeadline: 'Wahlschlüssel',
              pdfType: PdfType.VOTING_KEY,
            })
          )
        ),
        switchMap((pdfBytes) => {
          const formattedDate = formatDate(new Date());
          return from(
            this.fileSaveService.savePdf({
              fileName: 'wahlschluessel-' + formattedDate,
              pdfBytes,
            })
          );
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Fehler beim Export:', err);
        },
      });
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
      this.masterKeyImportError = 'Bitte eine PDF-Datei wählen.';
      return;
    }

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const qrString = await this.pdfService.extractQrImportStringFromPdf(bytes);
      if (!qrString) {
        this.masterKeyImportError =
          'In dieser PDF wurden keine Schlüsseldaten gefunden. Bitte die exportierte Wahlschlüssel-PDF verwenden.';
        return;
      }
      this.processMasterKeyImportPayload(qrString);
    } catch (e) {
      this.masterKeyImportError =
        e instanceof Error ? e.message : 'Die PDF konnte nicht gelesen werden.';
    }
  }

  onMasterKeyQrScanCancel(): void {
    this.masterKeyQrScanOpened = false;
  }

  onMasterKeyQrScanSuccess(raw: string): void {
    this.masterKeyQrScanOpened = false;
    this.processMasterKeyImportPayload(raw);
  }

  private processMasterKeyImportPayload(raw: string): void {
    try {
      const payload = this.importService.parseQrString(raw);
      if (!this.importService.isMasterKeyPayload(payload)) {
        this.masterKeyImportError =
          'Dieser Inhalt enthält keinen Masterschlüssel. Bitte den Export-QR-Code verwenden.';
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
            this.masterKeyImportError = 'Der Masterschlüssel konnte nicht gespeichert werden.';
          },
        });
    } catch (e) {
      this.masterKeyImportError =
        e instanceof Error ? e.message : 'Die Schlüsseldaten konnten nicht gelesen werden.';
    }
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

  // --- Wahlschein-Import ---

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

  private mapBallotImportError(err: unknown): string {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'BALLOT_MASTER_MISMATCH') {
      return 'Passt nicht zu Ihrem Wahlschlüssel.';
    }
    if (msg === 'NO_MASTERKEY') {
      return 'Kein Wahlschlüssel vorhanden.';
    }
    return 'Wahlschein konnte nicht gespeichert werden.';
  }

  private async tryParseBallotFromPdf(
    file: File
  ): Promise<{ ballot: Ballot } | { error: string }> {
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return { error: 'Keine PDF-Datei.' };
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const qrString = await this.pdfService.extractQrImportStringFromPdf(bytes);
      if (!qrString) {
        return { error: 'Keine Wahlschein-Daten in der PDF.' };
      }
      const payload = this.importService.parseQrString(qrString);
      if (!this.importService.isBallotPayload(payload)) {
        return { error: 'Kein gültiger Wahlschein-Inhalt.' };
      }
      return { ballot: payload.data };
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : 'PDF konnte nicht gelesen werden.',
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
      this.ballotImportFeedbackTitle = 'Wahlschein-Import';
      this.ballotImportFeedbackMessage =
        okCount === 1
          ? 'Import erfolgreich.'
          : `${okCount} Wahlscheine erfolgreich importiert.`;
      this.ballotImportFeedbackOpen = true;
      return;
    }

    if (okCount === 0) {
      this.ballotImportFeedbackOpen = false;
      this.ballotImportError =
        failures.length === 1
          ? failures[0]
          : `Keiner der ${total} Importe war erfolgreich:\n\n${failures.join('\n')}`;
      return;
    }

    this.ballotImportError = `Bei ${failures.length} von ${total} Datei(en) ist ein Fehler aufgetreten:\n\n${failures.join('\n')}`;
    this.ballotImportFeedbackTitle = 'Wahlschein-Import';
    this.ballotImportFeedbackMessage = `${okCount} Wahlschein(e) erfolgreich importiert.`;
    this.ballotImportFeedbackOpen = true;
  }

  private processBallotImportPayload(raw: string): void {
    try {
      const payload = this.importService.parseQrString(raw);
      if (!this.importService.isBallotPayload(payload)) {
        this.ballotImportError =
          'Der Inhalt ist kein gültiger Wahlschein. Bitte den Export-QR dieser Wahl verwenden.';
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
        e instanceof Error ? e.message : 'Die Daten konnten nicht gelesen werden.';
    }
  }

  private async navigateToVoting(electionId: number): Promise<void> {
    this.ballotImportDialogOpened = false;
    this.ballotQrScanOpened = false;
    this.ballotImportFeedbackOpen = false;
    await this.router.navigate(['/election/vote', electionId]);
  }
}
