import { Injectable } from '@angular/core';
import { SavePdfOptions } from '../qr-code/save-pdf-options';
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

@Injectable({
  providedIn: 'root',
})
export class FileSaveService {
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
    const { fileName, pdfBytes, shareTitle, shareText } = options;

    const base64Data = this.uint8ArrayToBase64(pdfBytes);
    const finalFileName = this.ensurePdfExtension(fileName);

    const result = await Filesystem.writeFile({
      path: finalFileName,
      data: base64Data,
      directory: Directory.Documents,
      recursive: true,
    });

    await Share.share({
      title: shareTitle ?? "PDF teilen",
      text: shareText ?? "Hier ist dein PDF",
      url: result.uri,
    });
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
