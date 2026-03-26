import { Injectable } from '@angular/core';
import QRCode from "qrcode";

@Injectable({
  providedIn: 'root',
})
export class QrCodeService {
  async generateDataUrl(
    value: string,
    options?: {
      width?: number;
      margin?: number;
    }
  ): Promise<string> {
    return QRCode.toDataURL(value, {
      width: options?.width ?? 300,
      margin: options?.margin ?? 2,
    });
  }
}
