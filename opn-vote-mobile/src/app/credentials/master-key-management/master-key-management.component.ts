import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MasterKeyService } from 'src/app/services/master-key-service';
import { filter, from, map, Observable, switchMap, take } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MasterKey } from 'src/app/voting-system/masterkey';
import { PdfType } from 'src/app/qr-code/pdf-type';
import { QrCodeService } from 'src/app/services/qr-code-service';
import { PdfService } from 'src/app/services/pdf-service';
import { FileSaveService } from 'src/app/services/file-save-service';
import { formatDate } from 'src/app/formatting/date-formatting';
import { MasterKeySetupComponent } from "../master-key-setup/master-key-setup.component";
import { ImportDialogComponent } from 'src/app/import-dialog/import-dialog.component';
import { ImportService } from 'src/app/services/import-service';
import { QrScanDialogComponent } from 'src/app/qr-scan-dialog/qr-scan-dialog.component';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { QuestionDialogComponent } from 'src/app/question-dialog/question-dialog.component';
@Component({
  selector: 'app-master-key-management',
  templateUrl: './master-key-management.component.html',
  styleUrls: ['./master-key-management.component.scss'],
  imports: [AsyncPipe, MasterKeySetupComponent, ImportDialogComponent, QrScanDialogComponent, MessageDialogComponent, QuestionDialogComponent],
})
export class MasterKeyManagementComponent implements OnInit {
  constructor(
    private masterKeyService: MasterKeyService,
    private qrCodeService: QrCodeService,
    private pdfService: PdfService,
    private fileSaveService: FileSaveService,
    private importService: ImportService
  ) {}

  hasMasterKey$: Observable<boolean> = new Observable<boolean>(); 
  @Output() openInfoPopup: EventEmitter<void> = new EventEmitter<void>();
  importDialogOpened = false;
  qrScanOpened = false;
  scanSuccess = false;
  confirmDialog = false;
  importError: string | null = null;

  ngOnInit() {
    this.refresh();
  }

  private refresh() {
    this.hasMasterKey$ = this.masterKeyService.hasMasterKey();
  }

  onCreateMasterKey() {
    this.masterKeyService.createNewMasterKey().subscribe(() => this.refresh());
  }

  onExportMasterKey() {
    this.masterKeyService.getMasterKey().pipe(
      
      filter((masterKey): masterKey is MasterKey => !!masterKey),

      switchMap((masterKey) => {
        const qrCodeString = JSON.stringify({
          type: "master-key",
          version: 1,
          data: masterKey,
        });

        return from(this.qrCodeService.generateDataUrl(qrCodeString)).pipe(
          map((qrCodeDataUrl) => ({ masterKey, qrCodeString, qrCodeDataUrl }))
        );
      }),

      switchMap(({ qrCodeString, qrCodeDataUrl }) => {
        return from(
          this.pdfService.createPdf({
            qrCodeString,
            qrCodeDataUrl,
            downloadHeadline: "Wahlschlüssel",
            pdfType: PdfType.VOTING_KEY,
          })
        );
      }),

      switchMap((pdfBytes) => {
        const formattedDate = formatDate(new Date())
        return from(
          this.fileSaveService.savePdf({
            fileName: "wahlschluessel-" + formattedDate,
            pdfBytes,
          })
        );
      })
    ).subscribe({
      error: (err) => {
        console.error("Fehler beim Export:", err);
      }
    });
  }

  onImportMasterKey() {
    this.importError = null;
    this.importDialogOpened = true;
  }

  importViaScan() {
    this.importDialogOpened = false;
    this.importError = null;
    this.qrScanOpened = true;
  }

  onImportPdfFromDialog(file: File): void {
    this.importDialogOpened = false;
    this.importError = null;
    void this.onMasterKeyPdfFile(file);
  }

  async onMasterKeyPdfFile(file: File): Promise<void> {
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      this.importError = 'Bitte eine PDF-Datei wählen.';
      return;
    }

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const qrString = await this.pdfService.extractQrImportStringFromPdf(bytes);
      if (!qrString) {
        this.importError =
          'In dieser PDF wurden keine Schlüsseldaten gefunden. Bitte die exportierte Wahlschlüssel-PDF verwenden.';
        return;
      }
      this.processMasterKeyImport(qrString);
    } catch (e) {
      this.importError =
        e instanceof Error ? e.message : 'Die PDF konnte nicht gelesen werden.';
    }
  }

  onQrScanCancel(): void {
    this.qrScanOpened = false;
  }

  onQrScanSuccess(raw: string): void {
    this.qrScanOpened = false;
    this.processMasterKeyImport(raw);
  }

  private processMasterKeyImport(raw: string): void {
    try {
      const payload = this.importService.parseQrString(raw);
      if (!this.importService.isMasterKeyPayload(payload)) {
        this.importError =
          'Dieser Inhalt enthält keinen Masterschlüssel. Bitte den Export (QR oder Wahlschlüssel-PDF) verwenden.';
        return;
      }
      this.masterKeyService
        .importMasterKey(payload.data)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.scanSuccess = true;
            this.refresh();
          },
          error: () => {
            this.importError = 'Der Masterschlüssel konnte nicht gespeichert werden.';
          },
        });
    } catch (e) {
      this.importError =
        e instanceof Error ? e.message : 'Die Schlüsseldaten konnten nicht gelesen werden.';
    }
  }

  onDeleteMasterKey() {
    this.masterKeyService
      .deleteMasterKey()
      .subscribe(() => this.refresh());
    this.confirmDialog = false;
  }

  closeMessage() {
    this.scanSuccess = false;
  }
}
