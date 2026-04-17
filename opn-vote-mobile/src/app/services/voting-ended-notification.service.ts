import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { TranslationService } from '../i18n/translation.service';

const CHANNEL_ID = 'opnvote_voting';
const STORAGE_KEY_PREFIX = 'opnvote_voting_ended_notify_v1_';

export const VOTING_ENDED_NOTIFICATION_KIND = 'votingEnded' as const;

@Injectable({
  providedIn: 'root',
})
export class VotingEndedNotificationService {
  constructor(private readonly translation: TranslationService) {}

  async isEnabled(electionId: number): Promise<boolean> {
    try {
      const res = await SecureStoragePlugin.get({ key: this.storageKey(electionId) });
      if (!res.value) {
        return false;
      }
      const parsed = JSON.parse(res.value) as { votingEndIso?: string };
      return typeof parsed.votingEndIso === 'string';
    } catch {
      return false;
    }
  }

  async setEnabled(params: {
    electionId: number;
    votingEnd: Date;
    electionTitle: string;
    enabled: boolean;
  }): Promise<{ ok: true } | { ok: false; reason: string }> {
    const { electionId, votingEnd, electionTitle, enabled } = params;

    if (!enabled) {
      await this.cancel(electionId);
      return { ok: true };
    }

    if (votingEnd.getTime() <= Date.now()) {
      return { ok: false, reason: this.translation.translate('votingEndedNotify.pastEnd') };
    }

    if (!Capacitor.isNativePlatform()) {
      await SecureStoragePlugin.set({
        key: this.storageKey(electionId),
        value: JSON.stringify({
          votingEndIso: votingEnd.toISOString(),
          electionTitle,
        }),
      });
      return { ok: true };
    }

    try {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') {
        return {
          ok: false,
          reason: this.translation.translate('votingReminder.notificationsDenied'),
        };
      }

      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
          id: CHANNEL_ID,
          name: this.translation.translate('votingReminder.channelName'),
          description: this.translation.translate('votingReminder.channelDescription'),
          importance: 4,
          visibility: 1,
        });
      }

      const id = this.notificationId(electionId);
      await LocalNotifications.cancel({ notifications: [{ id }] });

      await LocalNotifications.schedule({
        notifications: [
          {
            title: this.translation.translate('votingEndedNotify.notificationTitle'),
            body: this.translation.translate('votingEndedNotify.notificationBody', {
              title: electionTitle,
            }),
            id,
            channelId: Capacitor.getPlatform() === 'android' ? CHANNEL_ID : undefined,
            schedule: {
              at: votingEnd,
              allowWhileIdle: true,
            },
            extra: { kind: VOTING_ENDED_NOTIFICATION_KIND },
          },
        ],
      });

      await SecureStoragePlugin.set({
        key: this.storageKey(electionId),
        value: JSON.stringify({
          votingEndIso: votingEnd.toISOString(),
          electionTitle,
        }),
      });

      return { ok: true };
    } catch {
      return { ok: false, reason: this.translation.translate('votingEndedNotify.scheduleError') };
    }
  }

  private async cancel(electionId: number): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.cancel({
          notifications: [{ id: this.notificationId(electionId) }],
        });
      } catch {
        // ignore
      }
    }
    try {
      await SecureStoragePlugin.remove({ key: this.storageKey(electionId) });
    } catch {
      // ignore
    }
  }

  private storageKey(electionId: number): string {
    return `${STORAGE_KEY_PREFIX}${electionId}`;
  }

  /**
   * Eigener ID-Bereich, damit keine Kollision mit {@link VotingReminderService} (dort oft electionId als ID).
   */
  private notificationId(electionId: number): number {
    const base = 2_000_000_000;
    const id = base + (electionId | 0);
    if (id > 2_147_000_000) {
      return base + (Math.abs(Math.imul(electionId, 2654435761)) % 100_000_000);
    }
    return id;
  }
}
