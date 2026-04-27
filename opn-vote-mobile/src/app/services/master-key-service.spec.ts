import { TestBed } from '@angular/core/testing';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { firstValueFrom } from 'rxjs';

import { clearAllBallotStorage } from './ballot-storage.util';
import { MasterKeyService } from './master-key-service';
import { VoteDraftService } from './vote-draft-service';
import { VoteParticipationStorageService } from './vote-participation-storage.service';
import type { MasterKey } from '../voting-system/masterkey';

jest.mock('capacitor-secure-storage-plugin', () => ({
  SecureStoragePlugin: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('./ballot-storage.util', () => ({
  clearAllBallotStorage: jest.fn().mockResolvedValue(undefined),
}));

const MASTER_KEY_STORAGE = 'opnvote_masterkey_v1';

describe('MasterKeyService', () => {
  let service: MasterKeyService;
  const store = new Map<string, string>();
  const voteDraft = { clearAllDrafts: jest.fn().mockResolvedValue(undefined) };
  const voteParticipation = { clearAll: jest.fn().mockResolvedValue(undefined) };
  const clearBallotsMock = clearAllBallotStorage as jest.MockedFunction<typeof clearAllBallotStorage>;

  const sampleMasterKey: MasterKey = {
    masterToken: {
      hexString: '0x0' + 'a'.repeat(63),
      isMaster: true,
      isBlinded: false,
    },
    masterR: {
      hexString: '0x' + 'b'.repeat(64),
      isMaster: true,
    },
  };

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

    TestBed.configureTestingModule({
      providers: [
        MasterKeyService,
        { provide: VoteDraftService, useValue: voteDraft },
        { provide: VoteParticipationStorageService, useValue: voteParticipation },
      ],
    });
    service = TestBed.inject(MasterKeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('hasMasterKey is false when storage empty', async () => {
    await expect(firstValueFrom(service.hasMasterKey())).resolves.toBe(false);
  });

  it('getMasterKey emits null when storage empty', async () => {
    await expect(firstValueFrom(service.getMasterKey())).resolves.toBeNull();
  });

  it('createNewMasterKey persists a master key with expected shape', async () => {
    const spy = jest.spyOn(crypto, 'getRandomValues').mockImplementation((arr) => {
      const a = arr as Uint8Array;
      for (let i = 0; i < a.length; i++) {
        a[i] = (i + 1) % 256;
      }
      return a as unknown as Uint8Array<ArrayBuffer>;
    });

    await firstValueFrom(service.createNewMasterKey());

    expect(store.has(MASTER_KEY_STORAGE)).toBe(true);
    const parsed = JSON.parse(store.get(MASTER_KEY_STORAGE)!) as MasterKey;
    expect(parsed.masterToken.isMaster).toBe(true);
    expect(parsed.masterToken.isBlinded).toBe(false);
    expect(parsed.masterR.isMaster).toBe(true);
    expect(parsed.masterToken.hexString).toMatch(/^0x[0-9a-f]{64}$/i);
    expect(parsed.masterR.hexString).toMatch(/^0x[0-9a-f]{64}$/i);

    spy.mockRestore();
  });

  it('getMasterKey loads from storage when cache is cold', async () => {
    store.set(MASTER_KEY_STORAGE, JSON.stringify(sampleMasterKey));

    const loaded = await firstValueFrom(service.getMasterKey());
    expect(loaded?.masterToken.hexString).toBe(sampleMasterKey.masterToken.hexString);
    expect(SecureStoragePlugin.get).toHaveBeenCalledWith({ key: MASTER_KEY_STORAGE });
  });

  it('getMasterKey uses in-memory cache on second read', async () => {
    store.set(MASTER_KEY_STORAGE, JSON.stringify(sampleMasterKey));

    await firstValueFrom(service.getMasterKey());
    jest.clearAllMocks();

    const again = await firstValueFrom(service.getMasterKey());
    expect(again?.masterToken.hexString).toBe(sampleMasterKey.masterToken.hexString);
    expect(SecureStoragePlugin.get).not.toHaveBeenCalled();
  });

  it('importMasterKey writes storage and updates cache', async () => {
    await firstValueFrom(service.importMasterKey(sampleMasterKey));

    expect(store.get(MASTER_KEY_STORAGE)).toBe(JSON.stringify(sampleMasterKey));
    await expect(firstValueFrom(service.getMasterKey())).resolves.toEqual(sampleMasterKey);
    expect(SecureStoragePlugin.get).not.toHaveBeenCalled();
  });

  it('deleteMasterKey removes key, clears cache, and calls cleanup collaborators', async () => {
    store.set(MASTER_KEY_STORAGE, JSON.stringify(sampleMasterKey));
    await firstValueFrom(service.getMasterKey());

    await firstValueFrom(service.deleteMasterKey());

    expect(SecureStoragePlugin.remove).toHaveBeenCalledWith({ key: MASTER_KEY_STORAGE });
    expect(store.has(MASTER_KEY_STORAGE)).toBe(false);
    expect(voteDraft.clearAllDrafts).toHaveBeenCalledTimes(1);
    expect(voteParticipation.clearAll).toHaveBeenCalledTimes(1);
    expect(clearBallotsMock).toHaveBeenCalledTimes(1);

    await expect(firstValueFrom(service.getMasterKey())).resolves.toBeNull();
    expect(SecureStoragePlugin.get).toHaveBeenCalled();
  });

  it('getMasterKey returns null for invalid JSON', async () => {
    store.set(MASTER_KEY_STORAGE, '{ not json');
    await expect(firstValueFrom(service.getMasterKey())).resolves.toBeNull();
  });

  it('getMasterKey returns null when masterToken.hexString missing', async () => {
    store.set(
      MASTER_KEY_STORAGE,
      JSON.stringify({
        masterToken: { isMaster: true, isBlinded: false },
        masterR: sampleMasterKey.masterR,
      }),
    );
    await expect(firstValueFrom(service.getMasterKey())).resolves.toBeNull();
  });

  it('getMasterKey returns null when masterR.hexString missing', async () => {
    store.set(
      MASTER_KEY_STORAGE,
      JSON.stringify({
        masterToken: sampleMasterKey.masterToken,
        masterR: { isMaster: true },
      }),
    );
    await expect(firstValueFrom(service.getMasterKey())).resolves.toBeNull();
  });
});
