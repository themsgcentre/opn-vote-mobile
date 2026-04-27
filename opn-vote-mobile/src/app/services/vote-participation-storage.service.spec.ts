import { TestBed } from '@angular/core/testing';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

import { VoteParticipationStorageService } from './vote-participation-storage.service';

jest.mock('capacitor-secure-storage-plugin', () => ({
  SecureStoragePlugin: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

describe('VoteParticipationStorageService', () => {
  let service: VoteParticipationStorageService;
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    jest.clearAllMocks();

    (SecureStoragePlugin.get as jest.Mock).mockImplementation(async ({ key }: { key: string }) => {
      const value = store.get(key);
      if (value === undefined) {
        throw new Error('Item with given key does not exist');
      }
      return { value };
    });
    (SecureStoragePlugin.set as jest.Mock).mockImplementation(async ({ key, value }: { key: string; value: string }) => {
      store.set(key, value);
    });
    (SecureStoragePlugin.remove as jest.Mock).mockImplementation(async ({ key }: { key: string }) => {
      store.delete(key);
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(VoteParticipationStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('recordRegistered adds id and returns it from getRegisteredIds', async () => {
    await service.recordRegistered(7);
    expect(await service.getRegisteredIds()).toEqual([7]);
    expect(await service.getVotedIds()).toEqual([]);
  });

  it('recordRegistered does not duplicate', async () => {
    await service.recordRegistered(1);
    await service.recordRegistered(1);
    expect(await service.getRegisteredIds()).toEqual([1]);
  });

  it('recordVoteCast moves id from registered to voted', async () => {
    await service.recordRegistered(5);
    await service.recordVoteCast(5);
    expect(await service.getRegisteredIds()).toEqual([]);
    expect(await service.getVotedIds()).toEqual([5]);
  });

  it('recordRegistered is no-op if already voted', async () => {
    await service.recordVoteCast(9);
    await service.recordRegistered(9);
    expect(await service.getRegisteredIds()).toEqual([]);
    expect(await service.getVotedIds()).toEqual([9]);
  });

  it('clearAll removes storage key', async () => {
    await service.recordRegistered(3);
    await service.clearAll();
    expect(store.size).toBe(0);
  });

  it('read normalizes registered ids that are also in votedIds', async () => {
    const key = 'opnvote_vote_participation_v4';
    store.set(
      key,
      JSON.stringify({
        registeredIds: [1, 2],
        votedIds: [2],
      }),
    );
    expect(await service.getRegisteredIds()).toEqual([1]);
    expect(await service.getVotedIds()).toEqual([2]);
  });
});
