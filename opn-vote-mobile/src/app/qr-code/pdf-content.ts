import { PDFFont, PDFImage, RGB } from "pdf-lib";

interface BaseContent {
  type: PdfContentType;
  marginTop?: number;
  start?: number;
  yPos?: number;
}

export interface TextContent extends BaseContent {
  type: "text";
  text: string;
  font?: PDFFont;
  fontSize?: number;
  xPos?: number;
  color?: RGB;
  maxWidth?: number;
  lineHeight?: number;
  wordBreaks?: string[];
  noPush?: boolean;
  link?: string;
}

export interface LineContent extends BaseContent {
  type: "line";
  path: string;
  moveX: number;
}

export interface ImageContent extends BaseContent {
  type: "image";
  image: PDFImage;
  options: {
    x: number;
    y?: number;
    width: number;
    height: number;
  };
}