import { Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { IonApp } from '@ionic/angular/standalone';
import { LayoutComponent } from './layout/layout.component';
import { VOTING_ENDED_NOTIFICATION_KIND } from './services/voting-ended-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, LayoutComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private notificationTapHandle: PluginListenerHandle | null = null;
  private appBackButtonHandle: PluginListenerHandle | null = null;

  ngOnInit(): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    void this.registerAndroidHardwareBackBridge();
    void this.registerVotingNotificationTap();
  }

  ngOnDestroy(): void {
    void this.notificationTapHandle?.remove();
    this.notificationTapHandle = null;
    void this.appBackButtonHandle?.remove();
    this.appBackButtonHandle = null;
  }

  private async registerAndroidHardwareBackBridge(): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }
    this.appBackButtonHandle = await App.addListener('backButton', () => {});
  }

  private async registerVotingNotificationTap(): Promise<void> {
    this.notificationTapHandle = await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (action) => {
        const extra = action.notification.extra as
          | { electionId?: number; kind?: string }
          | undefined;
        if (extra?.kind === VOTING_ENDED_NOTIFICATION_KIND) {
          return;
        }
        const electionId = extra?.electionId;
        if (electionId == null || !Number.isFinite(electionId)) {
          return;
        }
        this.zone.run(() => {
          void this.router.navigateByUrl(`election/vote/${electionId}`);
        });
      },
    );
  }
}
