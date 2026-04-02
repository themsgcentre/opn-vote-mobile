import { Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { IonApp } from '@ionic/angular/standalone';
import { LayoutComponent } from "./layout/layout.component";
import { VotingStartDialogService } from './services/voting-start-dialog-service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, LayoutComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly votingStartDialogService = inject(VotingStartDialogService);
  private notificationTapHandle: PluginListenerHandle | null = null;

  ngOnInit(): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    void this.registerVotingNotificationTap();
  }

  ngOnDestroy(): void {
    void this.notificationTapHandle?.remove();
    this.notificationTapHandle = null;
  }

  private async registerVotingNotificationTap(): Promise<void> {
    this.notificationTapHandle = await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (action) => {
        const extra = action.notification.extra as { electionId?: number } | undefined;
        const electionId = extra?.electionId;
        if (electionId == null || !Number.isFinite(electionId)) {
          return;
        }
        this.zone.run(() => {
          void (async () => {
            await this.votingStartDialogService.markPromptShown(electionId);
            await this.router.navigateByUrl(`election/vote/${electionId}`);
          })();
        });
      },
    );
  }
}
