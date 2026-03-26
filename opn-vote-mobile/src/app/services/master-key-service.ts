import { Injectable } from '@angular/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { from, map, Observable } from 'rxjs';
import { Token } from '../voting-system/token';
import { R } from '../voting-system/r';
import { MasterKey } from '../voting-system/masterkey';

@Injectable({
  providedIn: 'root',
})
export class MasterKeyService {
  private readonly STORAGE_KEY = 'opnvote_masterkey_v1';
  private cached: MasterKey | null = null;

  createNewMasterKey(): Observable<void> {
    return from(this.createAndStore());
  }

  getMasterKey(): Observable<MasterKey | null> {
    return from(this.load());
  }

  hasMasterKey(): Observable<boolean> {
    return this.getMasterKey().pipe(map(k => !!k));
  }

  deleteMasterKey(): Observable<void> {
    return from(this.remove());
  }

  importMasterKey(masterKey: MasterKey): Observable<void> {
    return from(this.persistMasterKey(masterKey));
  }

  private async createAndStore(): Promise<void> {
    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const rBytes = crypto.getRandomValues(new Uint8Array(32));

    const masterToken: Token = {
      hexString: this.bytesToHex(tokenBytes),
      isMaster: true,
      isBlinded: false,
    };

    const masterR: R = {
      hexString: this.bytesToHex(rBytes),
      isMaster: true,
    };

    const value: MasterKey = { masterToken, masterR };

    await SecureStoragePlugin.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(value),
    });

    this.cached = value;
  }

  private async persistMasterKey(masterKey: MasterKey): Promise<void> {
    await SecureStoragePlugin.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(masterKey),
    });
    this.cached = masterKey;
  }

  private async load(): Promise<MasterKey | null> {
    if (this.cached) return this.cached;

    try {
      const res = await SecureStoragePlugin.get({ key: this.STORAGE_KEY });
      if (!res.value) return null;

      const parsed = JSON.parse(res.value) as MasterKey;

      if (!parsed?.masterToken?.hexString || !parsed?.masterR?.hexString) return null;

      this.cached = parsed;
      return parsed;
    } catch {
      return null;
    }
  }

  private async remove(): Promise<void> {
    try {
      await SecureStoragePlugin.remove({ key: this.STORAGE_KEY });
    } finally {
      this.cached = null;
    }
  }

  private bytesToHex(bytes: Uint8Array): string {
    let hex = '0x';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }
}
