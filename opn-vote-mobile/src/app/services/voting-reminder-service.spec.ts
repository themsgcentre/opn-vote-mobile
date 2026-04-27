import { TestBed } from '@angular/core/testing';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

import { TranslationService } from '../i18n/translation.service';
import { VotingReminderService } from './voting-reminder-service';

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

describe('VotingReminderService', () => {
  let service: VotingReminderService;
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
    service = TestBed.inject(VotingReminderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isReminderScheduled returns false when nothing stored', async () => {
    await expect(service.isReminderScheduled(1, new Date('2030-01-01'))).resolves.toBe(false);
  });

  it('isReminderScheduled returns true when stored votingStart matches', async () => {
    const start = new Date('2030-06-15T12:00:00.000Z');
    store.set(
      'opnvote_voting_reminder_v2_42',
      JSON.stringify({ votingStartIso: start.toISOString() }),
    );
    await expect(service.isReminderScheduled(42, start)).resolves.toBe(true);
    await expect(service.isReminderScheduled(42, new Date('2030-06-16T12:00:00.000Z'))).resolves.toBe(false);
  });

  it('scheduleVotingStartReminder rejects voting start in the past', async () => {
    const res = await service.scheduleVotingStartReminder({
      electionId: 1,
      votingStart: new Date(Date.now() - 60_000),
      electionTitle: 'X',
    });
    expect(res).toEqual({ ok: false, reason: TestBed.inject(TranslationService).translate('votingReminder.startInPast') });
  });

  it('scheduleVotingStartReminder on web persists preference and skips LocalNotifications', async () => {
    const start = new Date(Date.now() + 3600_000);
    const res = await service.scheduleVotingStartReminder({
      electionId: 5,
      votingStart: start,
      electionTitle: 'Wahl',
    });
    expect(res).toEqual({ ok: true });
    expect(LocalNotifications.schedule).not.toHaveBeenCalled();
    expect(store.get('opnvote_voting_reminder_v2_5')).toContain(start.toISOString());
  });

  it('cancelVotingStartReminder removes storage on web', async () => {
    store.set('opnvote_voting_reminder_v2_7', JSON.stringify({ votingStartIso: new Date().toISOString() }));
    await expect(service.cancelVotingStartReminder(7)).resolves.toEqual({ ok: true });
    expect(store.has('opnvote_voting_reminder_v2_7')).toBe(false);
  });
});
