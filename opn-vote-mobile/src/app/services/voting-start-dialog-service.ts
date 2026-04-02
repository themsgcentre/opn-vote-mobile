import { Injectable } from '@angular/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const STORAGE_KEY_PREFIX = 'opnvote_voting_start_prompt_shown_v1_';

@Injectable({
  providedIn: 'root',
})
export class VotingStartDialogService {
  async hasShownPrompt(electionId: number): Promise<boolean> {
    try {
      const res = await SecureStoragePlugin.get({ key: this.keyFor(electionId) });
      return res.value === '1';
    } catch {
      return false;
    }
  }

  async markPromptShown(electionId: number): Promise<void> {
    await SecureStoragePlugin.set({
      key: this.keyFor(electionId),
      value: '1',
    });
  }

  private keyFor(electionId: number): string {
    return `${STORAGE_KEY_PREFIX}${electionId}`;
  }
}
