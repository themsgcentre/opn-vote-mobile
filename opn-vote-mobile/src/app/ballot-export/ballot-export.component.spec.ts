import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BallotExportComponent } from './ballot-export.component';
import { BallotService } from '../services/ballot-service';
import { ElectionService } from '../services/election-service';
import { QrCodeService } from '../services/qr-code-service';
import { PdfService } from '../services/pdf-service';
import { FileSaveService } from '../services/file-save-service';
import type { ElectionInformation } from '../interfaces/election';

describe('BallotExportComponent', () => {
  let fixture: ComponentFixture<BallotExportComponent>;

  const mockElection: ElectionInformation = {
    id: 42,
    title: 'Test-Wahl',
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BallotExportComponent],
      providers: [
        {
          provide: BallotService,
          useValue: { listElectionIdsWithValidBallot: () => of([42]) },
        },
        {
          provide: ElectionService,
          useValue: { getElectionInformation: () => of(mockElection) },
        },
        { provide: QrCodeService, useValue: { generateDataUrl: () => Promise.resolve('') } },
        { provide: PdfService, useValue: { createPdf: () => Promise.resolve(new Uint8Array()) } },
        { provide: FileSaveService, useValue: { savePdf: () => Promise.resolve() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BallotExportComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
