import { Injectable } from '@angular/core';
import { ExportPayload } from '../interfaces/export-payload';
import { MasterKey } from '../voting-system/masterkey';
import { Ballot } from '../voting-system/ballot';
import { R } from '../voting-system/r';
import { Token } from '../voting-system/token';

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  parseQrString(qrString: string): ExportPayload<unknown> {
    let parsed: unknown;

    try {
      parsed = JSON.parse(qrString);
    } catch {
      throw new Error("QR-Code enthält kein gültiges JSON.");
    }

    if (!this.isExportPayload(parsed)) {
      throw new Error("QR-Code hat kein gültiges Import-Format.");
    }

    return parsed;
  }

  isMasterKeyPayload(payload: ExportPayload<unknown>): payload is ExportPayload<MasterKey> {
    return payload.type === "master-key" && this.isMasterKey(payload.data);
  }

  isBallotPayload(payload: ExportPayload<unknown>): payload is ExportPayload<Ballot> {
    return payload.type === "ballot" && this.isBallot(payload.data);
  }

  private isExportPayload(value: unknown): value is ExportPayload<unknown> {
    if (!value || typeof value !== "object") {
      return false;
    }

    const candidate = value as Partial<ExportPayload<unknown>>;

    return (
      (candidate.type === "ballot" || candidate.type === "master-key") &&
      typeof candidate.version === "number" &&
      "data" in candidate
    );
  }

  private isMasterKey(value: unknown): value is MasterKey {
    if (!value || typeof value !== "object") {
      return false;
    }

    const candidate = value as Partial<MasterKey>;

    return (
      this.isToken(candidate.masterToken) &&
      this.isR(candidate.masterR)
    );
  }

  private isBallot(value: unknown): value is Ballot {
    if (!value || typeof value !== "object") {
      return false;
    }

    const candidate = value as Partial<Ballot>;

    return (
      typeof candidate.electionId === "number" &&
      Number.isFinite(candidate.electionId) &&
      candidate.electionId > 0 &&

      typeof candidate.unblindedElectionTokenHex === "string" &&
      candidate.unblindedElectionTokenHex.length > 0 &&

      typeof candidate.unblindedSignatureHex === "string" &&
      candidate.unblindedSignatureHex.length > 0
    );
  }

  private isR(value: unknown): value is R {
    if (!value || typeof value !== "object") {
      return false;
    }

    const candidate = value as Partial<R>;

    return (
      typeof candidate.hexString === "string" &&
      candidate.hexString.length > 0 &&
      typeof candidate.isMaster === "boolean"
    );
  }

  private isToken(value: unknown): value is Token {
    if (!value || typeof value !== "object") {
      return false;
    }

    const candidate = value as Partial<Token>;

    return (
      typeof candidate.hexString === "string" &&
      this.isHexString(candidate.hexString) &&
      typeof candidate.isMaster === "boolean" &&
      typeof candidate.isBlinded === "boolean"
    );
  }

  private isHexString(value: unknown): value is string {
    return (
      typeof value === "string" &&
      value.length > 0 &&
      /^[0-9a-fA-F]+$/.test(value)
    );
  }
}
