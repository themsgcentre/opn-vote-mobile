import { Injectable } from '@angular/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MasterKeyService {
  private readonly STORAGE_KEY = 'opnvote_masterkey_v1';
  private cached: string | null = null;

  createNewMasterKey(): Observable<void> {
    return from(this.createAndStore());
  }

  getMasterKey(): Observable<string | null> {
    return from(this.load());
  }

  hasMasterKey(): Observable<boolean> {
    return this.getMasterKey().pipe(map(k => !!k));
  }

  deleteMasterKey(): Observable<void> {
    return from(this.remove());
  }

  private async createAndStore(): Promise<void> {
    const raw = crypto.getRandomValues(new Uint8Array(32)); 
    const b64 = this.uint8ToBase64(raw);

    await SecureStoragePlugin.set({ key: this.STORAGE_KEY, value: b64 });
    this.cached = b64;
  }

  private async load(): Promise<string | null> {
    if (this.cached) return this.cached;

    try {
      const res = await SecureStoragePlugin.get({ key: this.STORAGE_KEY });
      this.cached = res.value ?? null;
      return this.cached;
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

  private uint8ToBase64(u8: Uint8Array): string {
    let s = '';
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s);
  }
}
