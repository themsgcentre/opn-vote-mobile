import { Injectable, inject } from '@angular/core';
import { SavePdfOptions } from '../qr-code/save-pdf-options';
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class FileSaveService {
  private readonly toastController = inject(ToastController);

  public async savePdf(options: SavePdfOptions): Promise<void> {
    const { fileName, pdfBytes } = options;

    if (Capacitor.isNativePlatform()) {
      await this.savePdfNative(options);
      return;
    }

    this.savePdfWeb(pdfBytes, fileName);
  }

  public getPlatform(): "web" | "ios" | "android" {
    const platform = Capacitor.getPlatform();

    if (platform === "ios" || platform === "android") {
      return platform;
    }

    return "web";
  }

  public isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  private savePdfWeb(pdfBytes: Uint8Array, fileName: string): void {
    const pdfArrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer;
    
    const blob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = this.ensurePdfExtension(fileName);
    link.click();

    URL.revokeObjectURL(url);
  }

  private async savePdfNative(options: SavePdfOptions): Promise<void> {
    const { fileName, pdfBytes } = options;

    const base64Data = this.uint8ArrayToBase64(pdfBytes);
    const finalFileName = this.ensurePdfExtension(fileName);

    await Filesystem.writeFile({
      path: finalFileName,
      data: base64Data,
      directory: Directory.Documents,
      recursive: true,
    });

    const toast = await this.toastController.create({
      message: `PDF gespeichert: ${finalFileName}. In der Dateien-App unter „Dokumente“ dieser App.`,
      duration: 4000,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }

  private ensurePdfExtension(fileName: string): string {
    return fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = "";
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
  }
}
