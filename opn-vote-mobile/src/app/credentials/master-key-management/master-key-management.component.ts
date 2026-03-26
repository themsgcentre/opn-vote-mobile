import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MasterKeyService } from 'src/app/services/master-key-service';
import { filter, from, map, Observable, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MasterKey } from 'src/app/voting-system/masterkey';
import { PdfType } from 'src/app/qr-code/pdf-type';
import { QrCodeService } from 'src/app/services/qr-code-service';
import { PdfService } from 'src/app/services/pdf-service';
import { FileSaveService } from 'src/app/services/file-save-service';
import { formatDate } from 'src/app/formatting/date-formatting';
import { MasterKeySetupComponent } from "../master-key-setup/master-key-setup.component";

@Component({
  selector: 'app-master-key-management',
  templateUrl: './master-key-management.component.html',
  styleUrls: ['./master-key-management.component.scss'],
  imports: [AsyncPipe, MasterKeySetupComponent],
})
export class MasterKeyManagementComponent implements OnInit {
  constructor(
    private masterKeyService: MasterKeyService,
    private qrCodeService: QrCodeService,
    private pdfService: PdfService,
    private fileSaveService: FileSaveService
  ) {}
  hasMasterKey$: Observable<boolean> = new Observable<boolean>(); 
  @Output() openInfoPopup: EventEmitter<void> = new EventEmitter<void>();

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
    throw new Error('Method not implemented.');
  }

  onDeleteMasterKey() {
    this.masterKeyService
      .deleteMasterKey()
      .subscribe(() => this.refresh());
  }
}
