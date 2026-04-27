import { TestBed } from '@angular/core/testing';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

import { VoteDraftService } from './vote-draft-service';
import { VoteOption } from '../models/vote-option';

jest.mock('capacitor-secure-storage-plugin', () => ({
  SecureStoragePlugin: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    keys: jest.fn(),
  },
}));

describe('VoteDraftService', () => {
  let service: VoteDraftService;
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    jest.clearAllMocks();

    (SecureStoragePlugin.get as jest.Mock).mockImplementation(async ({ key }: { key: string }) => {
      const value = store.get(key);
      if (value === undefined) {
        throw new Error('not found');
      }
      return { value };
    });
    (SecureStoragePlugin.set as jest.Mock).mockImplementation(async ({ key, value }: { key: string; value: string }) => {
      store.set(key, value);
    });
    (SecureStoragePlugin.remove as jest.Mock).mockImplementation(async ({ key }: { key: string }) => {
      store.delete(key);
    });
    (SecureStoragePlugin.keys as jest.Mock).mockImplementation(async () => ({
      value: [...store.keys()],
    }));

    TestBed.configureTestingModule({});
    service = TestBed.inject(VoteDraftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('save and load round-trip valid votes', async () => {
    await service.save(10, { 1: VoteOption.Yes, 2: VoteOption.No });
    const loaded = await service.load(10);
    expect(loaded).toEqual({ 1: VoteOption.Yes, 2: VoteOption.No });
  });

  it('save with empty object clears draft', async () => {
    await service.save(10, { 1: VoteOption.Yes });
    await service.save(10, {});
    expect(await service.load(10)).toBeNull();
  });

  it('load returns null for missing or invalid payload', async () => {
    expect(await service.load(99)).toBeNull();
    store.set('opnvote_vote_draft_v3_99', JSON.stringify({ v: 0, votes: { '1': 0 } }));
    expect(await service.load(99)).toBeNull();
  });

  it('load ignores invalid vote option values', async () => {
    store.set(
      'opnvote_vote_draft_v3_11',
      JSON.stringify({ v: 1, votes: { '1': 0, '2': 99 } }),
    );
    expect(await service.load(11)).toEqual({ 1: VoteOption.Yes });
  });

  it('clearAllDrafts removes only draft keys', async () => {
    store.set('opnvote_vote_draft_v3_1', JSON.stringify({ v: 1, votes: { '1': 0 } }));
    store.set('other_key', 'keep');
    await service.clearAllDrafts();
    expect(store.has('opnvote_vote_draft_v3_1')).toBe(false);
    expect(store.get('other_key')).toBe('keep');
  });
});
