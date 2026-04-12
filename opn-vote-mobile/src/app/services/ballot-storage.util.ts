import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export const BALLOT_INDEX_KEY = 'opnvote_ballot_index_v2';

export function ballotKeyForElection(electionId: number): string {
  return `${BALLOT_INDEX_KEY}_${electionId}`;
}

async function loadBallotIndexIds(): Promise<number[]> {
  try {
    const res = await SecureStoragePlugin.get({ key: BALLOT_INDEX_KEY });
    if (!res.value) {
      return [];
    }
    const parsed = JSON.parse(res.value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is number => Number.isInteger(id));
  } catch {
    return [];
  }
}

export async function clearAllBallotStorage(): Promise<void> {
  const ids = await loadBallotIndexIds();
  for (const electionId of ids) {
    try {
      await SecureStoragePlugin.remove({ key: ballotKeyForElection(electionId) });
    } catch {
      // Key kann fehlen
    }
  }
  try {
    await SecureStoragePlugin.remove({ key: BALLOT_INDEX_KEY });
  } catch {
    // Index kann fehlen
  }
}
