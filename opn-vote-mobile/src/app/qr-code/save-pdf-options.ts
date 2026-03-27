export interface SavePdfOptions {
  fileName: string;
  pdfBytes: Uint8Array;
  shareTitle?: string;
  shareText?: string;
}