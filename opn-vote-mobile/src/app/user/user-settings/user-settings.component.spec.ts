import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AlertController } from '@ionic/angular/standalone';

import { UserSettingsComponent } from './user-settings.component';
import { BallotService } from '../../services/ballot-service';
import { FileSaveService } from '../../services/file-save-service';
import { ImportService } from '../../services/import-service';
import { MasterKeyService } from '../../services/master-key-service';
import { PdfService } from '../../services/pdf-service';
import { QrCodeService } from '../../services/qr-code-service';
import { VoteParticipationStorageService } from '../../services/vote-participation-storage.service';
import type { Ballot } from '../../voting-system/ballot';

const stubBallotForExport: Ballot = {
  electionId: 1,
  unblindedElectionTokenHex: '0x00',
  unblindedSignatureHex: '0x00',
};

describe('UserSettingsComponent', () => {
  let fixture: ComponentFixture<UserSettingsComponent>;

  const routerMock = { navigate: jest.fn(() => Promise.resolve(true)) };

  const masterKeyServiceMock = {
    hasMasterKey: jest.fn(() => of(false)),
    createNewMasterKey: jest.fn(() => of(undefined)),
    deleteMasterKey: jest.fn(() => of(undefined)),
    getMasterKey: jest.fn(() => of(null)),
    importMasterKey: jest.fn(() => of(undefined)),
  };

  const ballotServiceMock = {
    importBallot: jest.fn(() => of(undefined)),
    listElectionIdsWithValidBallot: jest.fn(() => of([] as number[])),
    loadBallot: jest.fn(() => of(stubBallotForExport)),
  };

  const qrCodeServiceMock = {
    generateDataUrl: jest.fn(() => Promise.resolve('')),
  };

  const pdfServiceMock = {
    extractQrImportStringFromPdf: jest.fn(() => Promise.resolve('')),
    createPdf: jest.fn(() => Promise.resolve(new Uint8Array())),
  };

  const fileSaveServiceMock = {
    savePdf: jest.fn(() => Promise.resolve()),
  };

  const importServiceMock = {
    parseQrString: jest.fn(),
    isMasterKeyPayload: jest.fn(() => false),
    isBallotPayload: jest.fn(() => false),
  };

  const voteParticipationStorageMock = {
    recordRegistered: jest.fn(() => Promise.resolve()),
  };

  const alertControllerMock = {
    create: jest.fn().mockResolvedValue({
      present: jest.fn(),
    } as unknown as HTMLIonAlertElement),
  } as unknown as AlertController;

  beforeEach(async () => {
    jest.clearAllMocks();
    masterKeyServiceMock.hasMasterKey.mockReturnValue(of(false));
    masterKeyServiceMock.createNewMasterKey.mockReturnValue(of(undefined));
    masterKeyServiceMock.deleteMasterKey.mockReturnValue(of(undefined));
    masterKeyServiceMock.getMasterKey.mockReturnValue(of(null));
    masterKeyServiceMock.importMasterKey.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [UserSettingsComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: MasterKeyService, useValue: masterKeyServiceMock },
        { provide: BallotService, useValue: ballotServiceMock },
        { provide: QrCodeService, useValue: qrCodeServiceMock },
        { provide: PdfService, useValue: pdfServiceMock },
        { provide: FileSaveService, useValue: fileSaveServiceMock },
        { provide: ImportService, useValue: importServiceMock },
        { provide: VoteParticipationStorageService, useValue: voteParticipationStorageMock },
        { provide: AlertController, useValue: alertControllerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSettingsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('openInfoPopup sets active type and popupTitle reflects masterkey', () => {
    const c = fixture.componentInstance;
    c.openInfoPopup('masterkey');
    expect(c.activeInfoPopup).toBe('masterkey');
    expect(c.popupTitle).toContain('Masterkey');
    expect(c.popupText.length).toBeGreaterThan(0);
  });

  it('openInfoPopup uses provider and ballot copy for popupTitle', () => {
    const c = fixture.componentInstance;
    c.openInfoPopup('provider');
    expect(c.popupTitle).toContain('Provider');
    c.openInfoPopup('ballot');
    expect(c.popupTitle).toContain('Wahlschein');
  });

  it('closeInfoPopup clears active popup', () => {
    const c = fixture.componentInstance;
    c.openInfoPopup('masterkey');
    c.closeInfoPopup();
    expect(c.activeInfoPopup).toBeNull();
  });

  it('onMasterKeyExportClicked opens the export confirm flag', () => {
    const c = fixture.componentInstance;
    c.onMasterKeyExportClicked();
    expect(c.masterKeyExportConfirmDialogOpen).toBe(true);
  });

  it('onMasterKeyExportSecurityNo closes export confirm', () => {
    const c = fixture.componentInstance;
    c.masterKeyExportConfirmDialogOpen = true;
    c.onMasterKeyExportSecurityNo();
    expect(c.masterKeyExportConfirmDialogOpen).toBe(false);
  });

  it('onMasterKeyExportSecurityYes closes confirm without calling services when no key', () => {
    const c = fixture.componentInstance;
    c.masterKeyExportConfirmDialogOpen = true;
    c.onMasterKeyExportSecurityYes();
    expect(c.masterKeyExportConfirmDialogOpen).toBe(false);
    expect(qrCodeServiceMock.generateDataUrl).not.toHaveBeenCalled();
  });

  it('onOpenMasterKeyImport clears error and opens dialog', () => {
    const c = fixture.componentInstance;
    c.masterKeyImportError = 'x';
    c.onOpenMasterKeyImport();
    expect(c.masterKeyImportError).toBeNull();
    expect(c.masterKeyImportDialogOpened).toBe(true);
  });

  it('masterKeyImportViaScan closes import dialog and opens QR scan', () => {
    const c = fixture.componentInstance;
    c.masterKeyImportDialogOpened = true;
    c.masterKeyImportViaScan();
    expect(c.masterKeyImportDialogOpened).toBe(false);
    expect(c.masterKeyQrScanOpened).toBe(true);
  });

  it('closeMasterKeyImportSuccess resets success flag', () => {
    const c = fixture.componentInstance;
    c.masterKeyImportSuccess = true;
    c.closeMasterKeyImportSuccess();
    expect(c.masterKeyImportSuccess).toBe(false);
  });

  it('handleMasterKeyPdfFile sets error for non-PDF files', async () => {
    const c = fixture.componentInstance;
    const file = new File(['x'], 'notes.txt', { type: 'text/plain' });
    await c.handleMasterKeyPdfFile(file);
    expect(c.masterKeyImportError).toContain('PDF');
  });

  it('onOpenBallotImport clears error and opens ballot import dialog', () => {
    const c = fixture.componentInstance;
    c.ballotImportError = 'e';
    c.onOpenBallotImport();
    expect(c.ballotImportError).toBeNull();
    expect(c.ballotImportDialogOpened).toBe(true);
  });

  it('closeBallotImportFeedback closes feedback', () => {
    const c = fixture.componentInstance;
    c.ballotImportFeedbackOpen = true;
    c.closeBallotImportFeedback();
    expect(c.ballotImportFeedbackOpen).toBe(false);
  });

  it('renders ballot import when master key panel is present', async () => {
    TestBed.resetTestingModule();
    masterKeyServiceMock.hasMasterKey.mockReturnValue(of(true));
    await TestBed.configureTestingModule({
      imports: [UserSettingsComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: MasterKeyService, useValue: masterKeyServiceMock },
        { provide: BallotService, useValue: ballotServiceMock },
        { provide: QrCodeService, useValue: qrCodeServiceMock },
        { provide: PdfService, useValue: pdfServiceMock },
        { provide: FileSaveService, useValue: fileSaveServiceMock },
        { provide: ImportService, useValue: importServiceMock },
        { provide: VoteParticipationStorageService, useValue: voteParticipationStorageMock },
        { provide: AlertController, useValue: alertControllerMock },
      ],
    }).compileComponents();

    const f = TestBed.createComponent(UserSettingsComponent);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();

    expect(f.nativeElement.querySelector('app-ballot-import')).toBeTruthy();
    expect(f.nativeElement.querySelector('app-ballot-export')).toBeTruthy();
  });
});
