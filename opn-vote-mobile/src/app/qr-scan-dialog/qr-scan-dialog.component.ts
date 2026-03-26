import {
  AfterViewInit,
  Component,
  EventEmitter,
  NgZone,
  OnDestroy,
  Output,
  inject,
} from '@angular/core';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

@Component({
  selector: 'app-qr-scan-dialog',
  standalone: true,
  templateUrl: './qr-scan-dialog.component.html',
  styleUrls: ['./qr-scan-dialog.component.scss'],
})
export class QrScanDialogComponent implements AfterViewInit, OnDestroy {
  private readonly ngZone = inject(NgZone);
  private html5QrCode: Html5Qrcode | null = null;
  /** Must match the element `id` in the template (Html5Qrcode resolves by id). */
  readonly readerElementId = 'mk-import-qr-reader';
  private decodeHandled = false;

  @Output() readonly scanSuccess = new EventEmitter<string>();
  @Output() readonly cancel = new EventEmitter<void>();

  cameraError: string | null = null;

  ngAfterViewInit(): void {
    void this.startScanner();
  }

  ngOnDestroy(): void {
    void this.stopScanner();
  }

  onCancelClick(): void {
    void this.stopScanner();
    this.cancel.emit();
  }

  private async startScanner(): Promise<void> {
    try {
      this.html5QrCode = new Html5Qrcode(this.readerElementId);
      await this.html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const edge = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72);
            return { width: edge, height: edge };
          },
        },
        (decodedText) => {
          if (this.decodeHandled) {
            return;
          }
          this.decodeHandled = true;
          this.ngZone.run(() => {
            this.scanSuccess.emit(decodedText);
          });
        },
        () => {
          /* per-frame decode miss — expected while searching */
        }
      );
    } catch {
      await this.stopScanner();
      this.ngZone.run(() => {
        this.cameraError =
          'Kamera konnte nicht gestartet werden. Bitte Berechtigung erteilen oder in den Einstellungen erlauben.';
      });
    }
  }

  private async stopScanner(): Promise<void> {
    const instance = this.html5QrCode;
    if (!instance) {
      return;
    }
    try {
      if (instance.getState() === Html5QrcodeScannerState.SCANNING) {
        await instance.stop();
      }
      instance.clear();
    } catch {
      /* teardown */
    }
    this.html5QrCode = null;
  }
}
