import { TestBed } from '@angular/core/testing';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

import { TranslationService } from '../i18n/translation.service';
import { VOTING_ENDED_NOTIFICATION_KIND, VotingEndedNotificationService } from './voting-ended-notification.service';

jest.mock('capacitor-secure-storage-plugin', () => ({
  SecureStoragePlugin: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    requestPermissions: jest.fn(),
    createChannel: jest.fn(),
    cancel: jest.fn(),
    schedule: jest.fn(),
  },
}));

describe('VotingEndedNotificationService', () => {
  let service: VotingEndedNotificationService;
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

    jest.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(false);
    jest.spyOn(Capacitor, 'getPlatform').mockReturnValue('web');

    TestBed.configureTestingModule({});
    service = TestBed.inject(VotingEndedNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('exports notification kind constant', () => {
    expect(VOTING_ENDED_NOTIFICATION_KIND).toBe('votingEnded');
  });

  it('isEnabled is false when nothing stored', async () => {
    await expect(service.isEnabled(1)).resolves.toBe(false);
  });

  it('isEnabled is true when votingEndIso present', async () => {
    store.set(
      'opnvote_voting_ended_notify_v1_3',
      JSON.stringify({ votingEndIso: new Date().toISOString(), electionTitle: 'T' }),
    );
    await expect(service.isEnabled(3)).resolves.toBe(true);
  });

  it('setEnabled with enabled false clears preference', async () => {
    store.set('opnvote_voting_ended_notify_v1_8', JSON.stringify({ votingEndIso: new Date().toISOString() }));
    await expect(
      service.setEnabled({
        electionId: 8,
        votingEnd: new Date(Date.now() + 86400_000),
        electionTitle: 'T',
        enabled: false,
      }),
    ).resolves.toEqual({ ok: true });
    expect(store.has('opnvote_voting_ended_notify_v1_8')).toBe(false);
  });

  it('setEnabled rejects past votingEnd when enabling', async () => {
    const res = await service.setEnabled({
      electionId: 2,
      votingEnd: new Date(Date.now() - 10_000),
      electionTitle: 'T',
      enabled: true,
    });
    expect(res).toEqual({ ok: false, reason: TestBed.inject(TranslationService).translate('votingEndedNotify.pastEnd') });
  });

  it('setEnabled on web stores preference without scheduling native notifications', async () => {
    const end = new Date(Date.now() + 7200_000);
    const res = await service.setEnabled({
      electionId: 4,
      votingEnd: end,
      electionTitle: 'Title',
      enabled: true,
    });
    expect(res).toEqual({ ok: true });
    expect(LocalNotifications.schedule).not.toHaveBeenCalled();
    const raw = store.get('opnvote_voting_ended_notify_v1_4');
    expect(raw).toContain(end.toISOString());
    expect(raw).toContain('Title');
  });
});
