import { Injectable } from '@angular/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const STORAGE_KEY = 'opnvote_vote_participation_v3';

type StoredShape = {
  registeredIds: number[];
  votedIds: number[];
};

const emptyState = (): StoredShape => ({
  registeredIds: [],
  votedIds: [],
});

@Injectable({
  providedIn: 'root',
})
export class VoteParticipationStorageService {
  async recordRegistered(electionId: number): Promise<void> {
    const state = await this.read();
    if (state.votedIds.includes(electionId)) {
      return;
    }
    if (!state.registeredIds.includes(electionId)) {
      state.registeredIds.push(electionId);
      await this.write(state);
    }
  }

  async recordVoteCast(electionId: number): Promise<void> {
    const state = await this.read();
    state.registeredIds = state.registeredIds.filter((id) => id !== electionId);
    if (!state.votedIds.includes(electionId)) {
      state.votedIds.push(electionId);
    }
    await this.write(state);
  }

  async getRegisteredIds(): Promise<number[]> {
    return [...(await this.read()).registeredIds];
  }

  async getVotedIds(): Promise<number[]> {
    return [...(await this.read()).votedIds];
  }

  private async read(): Promise<StoredShape> {
    try {
      const res = await SecureStoragePlugin.get({ key: STORAGE_KEY });
      const parsed = JSON.parse(res.value) as Partial<StoredShape>;
      const registeredIds = Array.isArray(parsed.registeredIds)
        ? parsed.registeredIds.filter((id) => Number.isFinite(id))
        : [];
      const votedIds = Array.isArray(parsed.votedIds)
        ? parsed.votedIds.filter((id) => Number.isFinite(id))
        : [];
      return {
        registeredIds: registeredIds.filter((id) => !votedIds.includes(id)),
        votedIds,
      };
    } catch {
      return emptyState();
    }
  }

  private async write(state: StoredShape): Promise<void> {
    const normalized: StoredShape = {
      registeredIds: state.registeredIds.filter((id) => !state.votedIds.includes(id)),
      votedIds: [...state.votedIds],
    };
    await SecureStoragePlugin.set({
      key: STORAGE_KEY,
      value: JSON.stringify(normalized),
    });
  }
}
