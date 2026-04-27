import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ElectionStatus } from '../models/election-status';
import { ElectionDTO } from '../models/election-dto';
import { ElectionProxyService } from './election-proxy-service';
import { ElectionService } from './election-service';

describe('ElectionService', () => {
  let service: ElectionService;
  let proxy: jest.Mocked<Pick<ElectionProxyService, 'getElectionById' | 'getElections' | 'getResults'>>;

  const dtoBase = (overrides: Partial<ElectionDTO> = {}): ElectionDTO => ({
    id: 1,
    descriptionBlob: JSON.stringify({ questions: [{ text: 'Q1', imageUrl: '' }] }),
    descriptionIpfsCid: '',
    authorizedVoterCount: 0,
    privateKey: null,
    publicKey: 'pk',
    registerPublicKeyE: '65537',
    registerPublicKeyN: 'n',
    registeredVoterCount: 0,
    registrationEndTime: 0,
    registrationStartTime: 0,
    status: ElectionStatus.Open,
    totalVotes: 0,
    transactionHash: '',
    votingEndTime: 0,
    votingStartTime: 0,
    ...overrides,
  });

  beforeEach(() => {
    proxy = {
      getElectionById: jest.fn(),
      getElections: jest.fn(),
      getResults: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ElectionProxyService, useValue: proxy }],
    });
    service = TestBed.inject(ElectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getElectionInformation maps DTO via proxy', (done) => {
    proxy.getElectionById!.mockReturnValue(of(dtoBase({ id: 9 })));
    service.getElectionInformation(9).subscribe((info) => {
      expect(info?.id).toBe(9);
      done();
    });
  });

  it('getQuestions parses descriptionBlob.questions', (done) => {
    proxy.getElectionById!.mockReturnValue(
      of(
        dtoBase({
          descriptionBlob: JSON.stringify({
            questions: [
              { text: 'A?', imageUrl: 'http://x/img.png' },
              { text: 'B?', imageUrl: '' },
            ],
          }),
        }),
      ),
    );
    service.getQuestions(1).subscribe((qs) => {
      expect(qs.length).toBe(2);
      expect(qs[0]).toEqual({ key: 0, text: 'A?', imageUrl: 'http://x/img.png' });
      expect(qs[1].key).toBe(1);
      done();
    });
  });

  it('getQuestions returns empty array when election missing', (done) => {
    proxy.getElectionById!.mockReturnValue(of(null));
    service.getQuestions(404).subscribe((qs) => {
      expect(qs).toEqual([]);
      done();
    });
  });

  it('getE and getN map register public key fields', (done) => {
    proxy.getElectionById!.mockReturnValue(of(dtoBase({ registerPublicKeyE: '3', registerPublicKeyN: '77' })));
    service.getE(1).subscribe((e) => {
      expect(e).toBe('3');
      service.getN(1).subscribe((n) => {
        expect(n).toBe('77');
        done();
      });
    });
  });

  it('getPublicKey maps dto.publicKey', (done) => {
    proxy.getElectionById!.mockReturnValue(of(dtoBase({ publicKey: 'coord-key' })));
    service.getPublicKey(1).subscribe((pk) => {
      expect(pk).toBe('coord-key');
      done();
    });
  });

  it('getAllElectionInformations filters by status', (done) => {
    proxy.getElections!.mockReturnValue(
      of([
        dtoBase({ id: 1, status: ElectionStatus.Open }),
        dtoBase({ id: 2, status: ElectionStatus.Pending }),
        dtoBase({ id: 3, status: ElectionStatus.ResultsPublished }),
        dtoBase({ id: 4, status: ElectionStatus.Canceled }),
        dtoBase({ id: 5, status: ElectionStatus.Ended }),
      ]),
    );
    service.getAllElectionInformations().subscribe((list) => {
      expect(list.map((x) => x.id).sort()).toEqual([1, 3, 5]);
      done();
    });
  });

  it('getResults delegates to proxy', (done) => {
    proxy.getResults!.mockReturnValue(of(null));
    service.getResults(5).subscribe((r) => {
      expect(r).toBeNull();
      expect(proxy.getResults).toHaveBeenCalledWith(5);
      done();
    });
  });
});
