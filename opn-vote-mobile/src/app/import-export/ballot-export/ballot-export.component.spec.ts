import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AlertController } from '@ionic/angular/standalone';
import { BallotExportComponent } from './ballot-export.component';
import { BallotService } from '../../services/ballot-service';
import { ElectionService } from '../../services/election-service';
import { QrCodeService } from '../../services/qr-code-service';
import { PdfService } from '../../services/pdf-service';
import { FileSaveService } from '../../services/file-save-service';
import type { ElectionInformation } from '../../models/election-information';
import type { Ballot } from '../../models/ballot';

const stubBallot: Ballot = {
  electionId: 42,
  unblindedElectionTokenHex: '0x00',
  unblindedSignatureHex: '0x00',
};

const mockElection: ElectionInformation = {
  id: 42,
  title: 'Fixture-Wahl (Komponententest)',
  summary: '',
  description: '',
  headerImage: { large: '', small: '' },
  backLink: '',
  author: '',
  authorizedVoterCount: 0,
  registeredVoterCount: 0,
  totalVotes: 0,
  registrationStart: new Date(),
  registrationEnd: new Date(),
  votingStart: new Date(),
  votingEnd: new Date(),
  status: 0,
};

function ballotExportProviders(electionIds: number[]) {
  const alert = {
    create: jest.fn().mockResolvedValue({ present: jest.fn() } as unknown as HTMLIonAlertElement),
  } as unknown as AlertController;

  return [
    { provide: AlertController, useValue: alert },
    {
      provide: BallotService,
      useValue: {
        listElectionIdsWithValidBallot: () => of(electionIds),
        loadBallot: jest.fn(() => of(stubBallot)),
      },
    },
    {
      provide: ElectionService,
      useValue: { getElectionInformation: () => of(mockElection) },
    },
    { provide: QrCodeService, useValue: { generateDataUrl: () => Promise.resolve('') } },
    { provide: PdfService, useValue: { createPdf: () => Promise.resolve(new Uint8Array()) } },
    { provide: FileSaveService, useValue: { savePdf: () => Promise.resolve() } },
  ];
}

describe('BallotExportComponent', () => {
  let fixture: ComponentFixture<BallotExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BallotExportComponent],
      providers: ballotExportProviders([42]),
    }).compileComponents();

    fixture = TestBed.createComponent(BallotExportComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows empty hint when there are no ballots', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [BallotExportComponent],
      providers: ballotExportProviders([]),
    }).compileComponents();

    const emptyFixture = TestBed.createComponent(BallotExportComponent);
    emptyFixture.detectChanges();
    await emptyFixture.whenStable();
    emptyFixture.detectChanges();

    expect(emptyFixture.nativeElement.querySelector('.empty-hint')).toBeTruthy();
    expect(emptyFixture.nativeElement.textContent).toContain('Keine gespeicherten');
  });

  it('requestBallotPdfExport sets confirm election id when idle', () => {
    const c = fixture.componentInstance;
    c.requestBallotPdfExport(7);
    expect(c.ballotExportConfirmElectionId).toBe(7);
  });

  it('requestBallotPdfExport ignores a second id while confirm is open', () => {
    const c = fixture.componentInstance;
    c.requestBallotPdfExport(7);
    c.requestBallotPdfExport(99);
    expect(c.ballotExportConfirmElectionId).toBe(7);
  });

  it('requestBallotPdfExport does nothing while an export is in progress', () => {
    const c = fixture.componentInstance;
    c.exportingElectionId = 1;
    c.requestBallotPdfExport(2);
    expect(c.ballotExportConfirmElectionId).toBeNull();
  });

  it('onBallotExportSecurityNo clears the confirm election id', () => {
    const c = fixture.componentInstance;
    c.ballotExportConfirmElectionId = 5;
    c.onBallotExportSecurityNo();
    expect(c.ballotExportConfirmElectionId).toBeNull();
  });

  it('onBallotExportSecurityYes clears confirm before starting export', async () => {
    const c = fixture.componentInstance;
    c.ballotExportConfirmElectionId = 42;
    c.onBallotExportSecurityYes();
    expect(c.ballotExportConfirmElectionId).toBeNull();
    await fixture.whenStable();
  });
});
