import {
  PDFDocument,
  PDFFont,
  PDFPage,
  PDFImage,
  StandardFonts,
  rgb,
  RGB,
  PDFName,
} from "pdf-lib";
import { t } from "i18next";
import { CreatePdfOptions } from "../qr-code/create-pdf-options";
import { PdfType } from "../qr-code/pdf-type";
import { PdfContentItem } from "../qr-code/pdf-content-item";
import { ElectionPdfInformation } from "../qr-code/election-pdf-info";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  public async createPdf(options: CreatePdfOptions): Promise<Uint8Array> {
    const {
      qrCodeString,
      qrCodeDataUrl,
      downloadHeadline,
      downloadSubHeadline,
      pdfType,
      pdfInformation,
      creatorLabel,
    } = options;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const qrImageBytes = this.dataUrlToUint8Array(qrCodeDataUrl);
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    const headerContent = this.buildStandardHeader(
      page,
      font,
      boldFont,
      downloadHeadline,
      creatorLabel
    );

    let additionalContent: PdfContentItem[] = [];

    switch (pdfType) {
      case PdfType.VOTING_KEY:
        additionalContent = this.buildElectionKeyContent(font, qrImage);
        break;

      case PdfType.ELECTION_PERMIT:
        additionalContent = this.buildElectionPermitContent(
          font,
          boldFont,
          qrImage,
          pdfInformation,
          downloadSubHeadline
        );
        break;

      default:
        throw new Error(`Unsupported pdfType: ${String(pdfType)}`);
    }

    this.drawContent(page, [...headerContent, ...additionalContent], font);

    pdfDoc.setTitle(downloadHeadline);
    pdfDoc.setAuthor("opn.vote");
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setSubject(`QRCODE:${qrCodeString}`);
    pdfDoc.setKeywords(["QR Code", "Metadata", downloadHeadline]);

    return await pdfDoc.save();
  }

  private buildStandardHeader(
    page: PDFPage,
    font: PDFFont,
    boldFont: PDFFont,
    downloadHeadline: string,
    creatorLabel?: string
  ): PdfContentItem[] {
    return [
      {
        type: "text",
        text: t("pdf.created", {
          CREATIONDATE: new Date(),
          interpolation: { escapeValue: false },
        }),
        yPos: page.getHeight() - 50,
        font,
        fontSize: 10,
      },
      {
        type: "text",
        text: downloadHeadline,
        yPos: page.getHeight() - 100,
        font: boldFont,
        fontSize: 26,
      },
      {
        type: "text",
        text: t("pdf.keepsecrethint"),
        yPos: page.getHeight() - 120,
        font,
        fontSize: 10,
      },
      {
        type: "line",
        path: "M 0,0 L520,0",
        moveX: 40,
        yPos: 670,
      },
      {
        type: "text",
        text: creatorLabel ? `${t("pdf.createdwith")}${creatorLabel}` : t("pdf.createdwith"),
        yPos: 10,
        font,
        fontSize: 7,
      },
    ];
  }

  private buildElectionKeyContent(font: PDFFont, qrImage: PDFImage): PdfContentItem[] {
    return [
      {
        type: "image",
        image: qrImage,
        start: 650,
        options: {
          x: 200,
          width: 200,
          height: 200,
        },
      },
      {
        type: "line",
        marginTop: 20,
        path: "M 0,0 L520,0",
        moveX: 40,
      },
      {
        type: "text",
        text: t("pdf.votingkey.additionalinfo.votingkeyexplained.1"),
        marginTop: 20,
        fontSize: 10,
        lineHeight: 12,
        maxWidth: 500,
        wordBreaks: [" "],
        font,
      },
      {
        type: "text",
        text: t("pdf.votingkey.additionalinfo.votingkeyexplained.2"),
        marginTop: 10,
        fontSize: 10,
        lineHeight: 12,
        maxWidth: 500,
        wordBreaks: [" "],
        font,
      },
      {
        type: "text",
        text: t("pdf.votingkey.additionalinfo.electionoverviewlink"),
        marginTop: 10,
        fontSize: 10,
        lineHeight: 12,
        font,
      },
      {
        type: "text",
        text: "www.openpetition.de/opn-vote",
        marginTop: 10,
        xPos: 200,
        color: rgb(0, 0, 1),
        fontSize: 10,
        font,
        link: "https://www.openpetition.de/opn-vote",
      },
    ];
  }

  private buildElectionPermitContent(
    font: PDFFont,
    boldFont: PDFFont,
    qrImage: PDFImage,
    pdfInformation?: ElectionPdfInformation,
    downloadSubHeadline?: string
  ): PdfContentItem[] {
    return [
      {
        type: "text",
        text: t("pdf.register.entitles"),
        fontSize: 10,
        start: 650,
        font,
      },
      {
        type: "text",
        text: downloadSubHeadline ?? "",
        fontSize: 14,
        maxWidth: 500,
        lineHeight: 14,
        wordBreaks: [" "],
        marginTop: 10,
        font: boldFont,
      },
      {
        type: "line",
        marginTop: 20,
        path: "M 0,0 L520,0",
        moveX: 40,
      },
      {
        type: "text",
        text: t("pdf.electionduration"),
        fontSize: 10,
        marginTop: 20,
        noPush: true,
        font,
      },
      {
        type: "text",
        text: t("pdf.electionfromto", {
          STARTDATE: pdfInformation?.STARTDATE ?? "",
          ENDDATE: pdfInformation?.ENDDATE ?? "",
          interpolation: { escapeValue: false },
        }),
        xPos: 200,
        fontSize: 10,
        marginTop: 1,
        font,
      },
      {
        type: "text",
        text: t("pdf.electionlink"),
        fontSize: 10,
        marginTop: 10,
        noPush: true,
        font,
      },
      {
        type: "text",
        text: pdfInformation?.ELECTION_URL ?? "",
        xPos: 200,
        color: rgb(0, 0, 1),
        fontSize: 10,
        marginTop: 1,
        font,
      },
      {
        type: "text",
        text: t("pdf.register.electionpermit.digital"),
        fontSize: 10,
        marginTop: 10,
        noPush: true,
        font,
      },
      {
        type: "image",
        image: qrImage,
        marginTop: 1,
        options: {
          x: 200,
          width: 200,
          height: 200,
        },
      },
      {
        type: "line",
        marginTop: 20,
        path: "M 0,0 L520,0",
        moveX: 40,
      },
      {
        type: "text",
        text: t("pdf.register.registerexplained.1"),
        fontSize: 10,
        marginTop: 20,
        maxWidth: 500,
        lineHeight: 12,
        wordBreaks: [" "],
        font,
      },
      {
        type: "text",
        text: t("pdf.register.registerexplained.2"),
        fontSize: 10,
        marginTop: 20,
        maxWidth: 500,
        lineHeight: 12,
        wordBreaks: [" "],
        font,
      },
      {
        type: "line",
        marginTop: 10,
        path: "M 0,0 L520,0",
        moveX: 40,
      },
      {
        type: "text",
        text: t("pdf.register.lawhint"),
        fontSize: 8,
        marginTop: 20,
        maxWidth: 500,
        lineHeight: 10,
        font,
      },
    ];
  }

  private drawContent(page: PDFPage, items: PdfContentItem[], fallbackFont: PDFFont): void {
    let yPos = 0;

    for (const item of items) {
      if (item.yPos !== undefined && item.marginTop === undefined) {
        yPos = item.yPos;
      }

      if (item.marginTop !== undefined) {
        yPos -= item.marginTop;
      }

      if (item.start !== undefined) {
        yPos = item.start;
      }

      if (item.type === "text") {
        const usedFont = item.font ?? fallbackFont;
        const fontSize = item.fontSize ?? 12;
        const x = item.xPos ?? 50;

        if (item.link) {
          const textWidth = usedFont.widthOfTextAtSize(item.text, fontSize);
          const textHeight = usedFont.heightAtSize(fontSize);

          const linkAnnotation = page.doc.context.obj({
            Type: "Annot",
            Subtype: "Link",
            Rect: [x, yPos - 2, x + textWidth, yPos + textHeight],
            Border: [0, 0, 0],
            A: {
              Type: "Action",
              S: "URI",
              URI: item.link,
            },
          });

          const annotations = page.node.Annots();
          if (annotations) {
            annotations.push(linkAnnotation);
          } else {
            page.node.set(PDFName.of("Annots"), page.doc.context.obj([linkAnnotation]));
          }
        }

        const drawOptions: {
          x: number;
          y: number;
          size: number;
          font: PDFFont;
          color: RGB;
          maxWidth?: number;
          lineHeight?: number;
          wordBreaks?: string[];
        } = {
          x,
          y: yPos,
          size: fontSize,
          font: usedFont,
          color: item.color ?? rgb(62 / 255, 61 / 255, 64 / 255),
        };

        if (item.maxWidth !== undefined) {
          drawOptions.maxWidth = item.maxWidth;
        }

        if (item.lineHeight !== undefined) {
          drawOptions.lineHeight = item.lineHeight;
        }

        if (item.wordBreaks !== undefined) {
          drawOptions.wordBreaks = item.wordBreaks;
        }

        page.drawText(item.text, drawOptions);

        if (!item.noPush) {
          yPos -= this.getPushDownHeight(
            {
              text: item.text,
              size: fontSize,
              maxWidth: item.maxWidth,
            },
            usedFont
          );
        }
      }

      if (item.type === "line") {
        page.moveTo(item.moveX, yPos);
        page.drawSvgPath(item.path, {
          borderColor: rgb(62 / 255, 61 / 255, 64 / 255),
          borderWidth: 1,
        });
      }

      if (item.type === "image") {
        yPos -= item.options.height;
        page.drawImage(item.image, {
          ...item.options,
          y: yPos,
        });
      }
    }
  }

  private getPushDownHeight(
    options: {
      text: string;
      size: number;
      maxWidth?: number;
    },
    font: PDFFont
  ): number {
    const width = font.widthOfTextAtSize(options.text, options.size);
    const height = font.heightAtSize(options.size);

    if (!options.maxWidth) {
      return height;
    }

    const lines = Math.max(1, Math.ceil(width / options.maxWidth));
    return lines * height;
  }

  private dataUrlToUint8Array(dataUrl: string): Uint8Array {
    const parts = dataUrl.split(",");
    const base64Data = parts[1];

    if (!base64Data) {
      throw new Error("Invalid image data URL format");
    }

    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i += 1) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  }
}