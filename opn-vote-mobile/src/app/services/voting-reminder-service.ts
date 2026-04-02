import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const CHANNEL_ID = 'opnvote_voting';
const STORAGE_KEY_PREFIX = 'opnvote_voting_reminder_v1_';

function notificationIdForElection(electionId: number): number {
  const id = electionId | 0;
  if (id <= 0 || id > 2_000_000_000) {
    return Math.abs(Math.imul(electionId, 2654435761) % 2_000_000_000) + 1;
  }
  return id;
}

@Injectable({
  providedIn: 'root',
})
export class VotingReminderService {
  async isReminderScheduled(electionId: number, votingStart: Date): Promise<boolean> {
    try {
      const res = await SecureStoragePlugin.get({ key: this.storageKey(electionId) });
      if (!res.value) {
        return false;
      }
      const parsed = JSON.parse(res.value) as { votingStartIso: string };
      return new Date(parsed.votingStartIso).getTime() === votingStart.getTime();
    } catch {
      return false;
    }
  }

  async scheduleVotingStartReminder(params: {
    electionId: number;
    votingStart: Date;
    electionTitle: string;
  }): Promise<{ ok: true } | { ok: false; reason: string }> {
    const { electionId, votingStart, electionTitle } = params;

    if (votingStart.getTime() <= Date.now()) {
      return { ok: false, reason: 'Der Wahlbeginn liegt bereits in der Vergangenheit.' };
    }

    if (!Capacitor.isNativePlatform()) {
      await SecureStoragePlugin.set({
        key: this.storageKey(electionId),
        value: JSON.stringify({ votingStartIso: votingStart.toISOString() }),
      });
      return { ok: true };
    }

    try {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') {
        return { ok: false, reason: 'Benachrichtigungen sind nicht erlaubt. Bitte in den Systemeinstellungen aktivieren.' };
      }

      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
          id: CHANNEL_ID,
          name: 'Abstimmungen',
          description: 'Erinnerungen zum Wahlbeginn',
          importance: 4,
          visibility: 1,
        });
      }

      const id = notificationIdForElection(electionId);
      await LocalNotifications.cancel({ notifications: [{ id }] });

      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Abstimmung hat begonnen',
            body: `Sie können jetzt bei „${electionTitle}“ abstimmen.`,
            id,
            channelId: Capacitor.getPlatform() === 'android' ? CHANNEL_ID : undefined,
            schedule: {
              at: votingStart,
              allowWhileIdle: true,
            },
            extra: { electionId },
          },
        ],
      });

      await SecureStoragePlugin.set({
        key: this.storageKey(electionId),
        value: JSON.stringify({ votingStartIso: votingStart.toISOString() }),
      });

      return { ok: true };
    } catch (e) {
      console.error('VotingReminderService.scheduleVotingStartReminder', e);
      return { ok: false, reason: 'Die Erinnerung konnte nicht eingerichtet werden.' };
    }
  }

  async cancelVotingStartReminder(electionId: number): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const id = notificationIdForElection(electionId);
        await LocalNotifications.cancel({ notifications: [{ id }] });
      } catch (e) {
        console.error('VotingReminderService.cancelVotingStartReminder', e);
      }
    }
    try {
      await SecureStoragePlugin.remove({ key: this.storageKey(electionId) });
    } catch {
      // Key may not exist.
    }
  }

  private storageKey(electionId: number): string {
    return `${STORAGE_KEY_PREFIX}${electionId}`;
  }
}
