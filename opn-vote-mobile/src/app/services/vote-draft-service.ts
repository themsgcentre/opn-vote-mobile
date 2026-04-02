import { Injectable } from '@angular/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { VoteOption } from '../voting-system/vote-option';

const STORAGE_KEY_PREFIX = 'opnvote_vote_draft_v3_';
const VERSION = 1;

type DraftPayload = {
  v: number;
  votes: Record<string, number>;
};

const VALID_OPTIONS = new Set<VoteOption>([
  VoteOption.Yes,
  VoteOption.No,
  VoteOption.Abstain,
]);

@Injectable({
  providedIn: 'root',
})
export class VoteDraftService {
  private keyFor(electionId: number): string {
    return `${STORAGE_KEY_PREFIX}${electionId}`;
  }

  async save(electionId: number, votes: Record<number, VoteOption>): Promise<void> {
    const keys = Object.keys(votes);
    if (keys.length === 0) {
      await this.clear(electionId);
      return;
    }
    const votesStr: Record<string, number> = {};
    for (const k of keys) {
      const q = Number(k);
      if (Number.isInteger(q)) {
        votesStr[String(q)] = votes[q];
      }
    }
    const payload: DraftPayload = { v: VERSION, votes: votesStr };
    await SecureStoragePlugin.set({
      key: this.keyFor(electionId),
      value: JSON.stringify(payload),
    });
  }

  async load(electionId: number): Promise<Record<number, VoteOption> | null> {
    try {
      const res = await SecureStoragePlugin.get({ key: this.keyFor(electionId) });
      if (!res.value) {
        return null;
      }
      const parsed = JSON.parse(res.value) as DraftPayload;
      if (parsed.v !== VERSION || !parsed.votes || typeof parsed.votes !== 'object') {
        return null;
      }
      const out: Record<number, VoteOption> = {};
      for (const [k, v] of Object.entries(parsed.votes)) {
        const qid = Number(k);
        if (!Number.isInteger(qid)) {
          continue;
        }
        if (typeof v !== 'number' || !VALID_OPTIONS.has(v as VoteOption)) {
          continue;
        }
        out[qid] = v as VoteOption;
      }
      return Object.keys(out).length > 0 ? out : null;
    } catch {
      return null;
    }
  }

  async clear(electionId: number): Promise<void> {
    try {
      await SecureStoragePlugin.remove({ key: this.keyFor(electionId) });
    } catch {
      // Key may not exist (e.g. first visit).
    }
  }

  async clearAllDrafts(): Promise<void> {
    try {
      const { value: keys } = await SecureStoragePlugin.keys();
      for (const key of keys) {
        if (!key.startsWith(STORAGE_KEY_PREFIX)) {
          continue;
        }
        try {
          await SecureStoragePlugin.remove({ key });
        } catch {
          // Einzelner Key kann fehlen oder nicht entfernbar sein.
        }
      }
    } catch {
      // keys() kann auf manchen Plattformen fehlschlagen.
    }
  }
}
