import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, type Observable } from 'rxjs';

import { RegistrationComponent } from './registration.component';
import { MasterKeyService } from 'src/app/services/master-key-service';
import { BallotService } from 'src/app/services/ballot-service';
import { ElectionService } from 'src/app/services/election-service';
import { VoteParticipationStorageService } from 'src/app/services/vote-participation-storage.service';
import { ApJwtService } from 'src/app/services/ap-jwt.service';
import { ElectionStatus } from 'src/app/models/election-status';
import type { ElectionInformation } from 'src/app/models/election-information';

function electionFixture(overrides: Partial<ElectionInformation> = {}): ElectionInformation {
  return {
    id: 5,
    title: 'Reg-Test-Wahl',
    summary: '',
    description: '',
    headerImage: { large: '', small: '' },
    backLink: '',
    author: '',
    authorizedVoterCount: 100,
    registeredVoterCount: 0,
    totalVotes: 0,
    registrationStart: new Date('2025-01-01'),
    registrationEnd: new Date('2030-12-31'),
    votingStart: new Date('2031-01-01'),
    votingEnd: new Date('2031-12-31'),
    status: ElectionStatus.Open,
    ...overrides,
  };
}

describe('RegistrationComponent', () => {
  const navigate = jest.fn(() => Promise.resolve(true));
  const navigateByUrl = jest.fn(() => Promise.resolve(true));
  const recordRegistered = jest.fn(() => Promise.resolve());

  const masterKeyServiceMock = {
    hasMasterKey: jest.fn(() => of(false)),
    createNewMasterKey: jest.fn(() => of(undefined)),
  };

  const ballotServiceMock = {
    hasBallot: jest.fn(() => of(false)),
    createBallot: jest.fn(() => of(undefined)),
  };

  const electionServiceMock = {
    getElectionInformation: jest.fn((): Observable<ElectionInformation | null> => of(electionFixture())),
    getN: jest.fn(() => of('0x01')),
    getE: jest.fn(() => of('0x010001')),
  };

  const apJwtServiceMock = {
    getProviderDisplayName: jest.fn(() => 'Test-AP'),
    fetchJwtForElection: jest.fn(() => Promise.resolve({ token: 'jwt-token' })),
  };

  async function createFixture(routeId: string | null) {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RegistrationComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: routeId == null ? convertToParamMap({}) : convertToParamMap({ id: routeId }),
            },
          },
        },
        { provide: Router, useValue: { navigate, navigateByUrl } },
        { provide: MasterKeyService, useValue: masterKeyServiceMock },
        { provide: BallotService, useValue: ballotServiceMock },
        { provide: ElectionService, useValue: electionServiceMock },
        { provide: VoteParticipationStorageService, useValue: { recordRegistered } },
        { provide: ApJwtService, useValue: apJwtServiceMock },
      ],
    }).compileComponents();

    const f = TestBed.createComponent(RegistrationComponent);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    return f;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    masterKeyServiceMock.hasMasterKey.mockReturnValue(of(false));
    masterKeyServiceMock.createNewMasterKey.mockReturnValue(of(undefined));
    ballotServiceMock.hasBallot.mockReturnValue(of(false));
    electionServiceMock.getElectionInformation.mockReturnValue(of(electionFixture()));
  });

  it('should create with valid route', async () => {
    const f = await createFixture('5');
    expect(f.componentInstance).toBeTruthy();
  });

  it('sets error view when election id is missing or invalid', async () => {
    const f = await createFixture('not-a-number');
    expect(f.componentInstance.view).toBe('error');
    expect(f.componentInstance.error).toBeTruthy();
  });

  it('sets error view when election is not found', async () => {
    TestBed.resetTestingModule();
    electionServiceMock.getElectionInformation.mockReturnValue(of(null) as Observable<ElectionInformation | null>);
    const f = await createFixture('5');
    expect(f.componentInstance.view).toBe('error');
  });

  it('redirects to voting when a ballot already exists', async () => {
    TestBed.resetTestingModule();
    ballotServiceMock.hasBallot.mockReturnValue(of(true));
    masterKeyServiceMock.hasMasterKey.mockReturnValue(of(true));
    electionServiceMock.getElectionInformation.mockReturnValue(of(electionFixture()));
    const f = await createFixture('5');
    expect(navigate).toHaveBeenCalledWith(['/election/vote/5']);
    expect(recordRegistered).toHaveBeenCalledWith(5);
  });

  it('shows registration closed when registration period has ended', async () => {
    TestBed.resetTestingModule();
    electionServiceMock.getElectionInformation.mockReturnValue(
      of(
        electionFixture({
          registrationEnd: new Date('2020-01-01'),
          votingStart: new Date('2020-02-01'),
          votingEnd: new Date('2020-03-01'),
        }),
      ),
    );
    const f = await createFixture('5');
    expect(f.componentInstance.view).toBe('registrationClosed');
  });

  it('shows master key setup when there is no master key', async () => {
    const f = await createFixture('5');
    expect(f.componentInstance.view).toBe('masterkey');
    expect(f.nativeElement.querySelector('app-master-key-setup')).toBeTruthy();
  });

  it('goHome navigates to home', async () => {
    const f = await createFixture('5');
    f.componentInstance.goHome();
    expect(navigateByUrl).toHaveBeenCalledWith('/home');
  });
});
