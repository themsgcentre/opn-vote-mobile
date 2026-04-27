import { TestBed } from '@angular/core/testing';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { firstValueFrom } from 'rxjs';

import { MasterKeyService } from './master-key-service';
import { VoteDraftService } from './vote-draft-service';
import { VoteParticipationStorageService } from './vote-participation-storage.service';

jest.mock('capacitor-secure-storage-plugin', () => ({
  SecureStoragePlugin: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

describe('MasterKeyService', () => {
  let service: MasterKeyService;
  const voteDraft = { clearAllDrafts: jest.fn().mockResolvedValue(undefined) };
  const voteParticipation = { clearAll: jest.fn().mockResolvedValue(undefined) };

  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStoragePlugin.get as jest.Mock).mockRejectedValue(new Error('missing'));

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
});
