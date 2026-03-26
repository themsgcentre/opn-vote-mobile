import { Component, OnInit } from '@angular/core';
import { MasterKeyService } from 'src/app/services/master-key-service';
import { filter, from, map, Observable, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MasterKey } from 'src/app/voting-system/masterkey';
import { PdfType } from 'src/app/qr-code/pdf-type';
import { QrCodeService } from 'src/app/services/qr-code-service';
import { PdfService } from 'src/app/services/pdf-service';
import { FileSaveService } from 'src/app/services/file-save-service';
type InfoPopupType = 'masterkey' | 'provider' | null;

@Component({
  selector: 'app-master-key-management',
  templateUrl: './master-key-management.component.html',
  styleUrls: ['./master-key-management.component.scss'],
  imports: [AsyncPipe],
})
export class MasterKeyManagementComponent implements OnInit {
  constructor(
    private masterKeyService: MasterKeyService,
    private qrCodeService: QrCodeService,
    private pdfService: PdfService,
    private fileSaveService: FileSaveService
  ) {}
  hasMasterKey$: Observable<boolean> = new Observable<boolean>(); 
  activeInfoPopup: InfoPopupType = null;

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
        const qrCodeString = JSON.stringify(masterKey);

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
        const formattedDate = new Date().toLocaleDateString("de-DE").replace(/\./g, "-");
        return from(
          this.fileSaveService.savePdf({
            fileName: "wahlschluessel-" + formattedDate,
            pdfBytes,
          })
        );
      })
    ).subscribe({
      next: () => {
        console.log("PDF erfolgreich erstellt & gespeichert");
      },
      error: (err) => {
        console.error("Fehler beim Export:", err);
      }
    });
  }

  onImportMasterKey() {
    throw new Error('Method not implemented.');
  }

  onDeleteMasterKey() {
    this.masterKeyService
      .deleteMasterKey()
      .subscribe(() => this.refresh());
  }

  openInfoPopup(type: InfoPopupType) {
    this.activeInfoPopup = type;
  }

  closeInfoPopup() {
    this.activeInfoPopup = null;
  }

  get popupTitle(): string {
    if (this.activeInfoPopup === 'masterkey') {
      return 'Masterkey';
    }

    if (this.activeInfoPopup === 'provider') {
      return 'Authorization Provider';
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

    return '';
  }
}
