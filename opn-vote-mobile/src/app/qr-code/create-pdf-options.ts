import { ElectionPdfInformation } from "./election-pdf-info";
import { PdfType } from "./pdf-type";

export interface CreatePdfOptions {
  qrCodeString: string;
  qrCodeDataUrl: string;
  downloadHeadline: string;
  downloadSubHeadline?: string;
  pdfType: PdfType;
  pdfInformation?: ElectionPdfInformation;
}