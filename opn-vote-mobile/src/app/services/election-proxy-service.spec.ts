import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { ElectionProxyService } from './election-proxy-service';
import { graphElectionRaw17 } from './fixtures/graph-election-raw-17.fixture';

const queryMock = jest.fn();

jest.mock('../server/apollo.config', () => ({
  graphClient: {
    query: (...args: unknown[]) => queryMock(...args),
  },
}));

describe('ElectionProxyService', () => {
  let service: ElectionProxyService;

  beforeEach(() => {
    queryMock.mockReset();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElectionProxyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getElectionById', () => {
    it('maps subgraph-shaped election to ElectionDTO', async () => {
      queryMock.mockResolvedValue({ data: { election: graphElectionRaw17 } });

      const dto = await firstValueFrom(service.getElectionById(17));
      expect(dto).not.toBeNull();
      expect(dto!.id).toBe(17);
      expect(dto!.status).toBe(1);
      expect(dto!.authorizedVoterCount).toBe(474);
      expect(dto!.registeredVoterCount).toBe(594);
      expect(dto!.totalVotes).toBe(542);
      expect(dto!.votingStartTime).toBe(1773978205);
      expect(JSON.parse(dto!.descriptionBlob).title).toContain('Fixture-Wahl');
      expect(queryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { id: '17' },
          fetchPolicy: 'network-only',
        }),
      );
    });

    it('returns null when data is missing', async () => {
      queryMock.mockResolvedValue({} as never);
      await expect(firstValueFrom(service.getElectionById(1))).resolves.toBeNull();
    });

    it('returns null when election is null', async () => {
      queryMock.mockResolvedValue({ data: { election: null } });
      await expect(firstValueFrom(service.getElectionById(1))).resolves.toBeNull();
    });

    it('returns null when election is undefined', async () => {
      queryMock.mockResolvedValue({ data: {} });
      await expect(firstValueFrom(service.getElectionById(1))).resolves.toBeNull();
    });

    it('propagates mapper errors for invalid id', async () => {
      queryMock.mockResolvedValue({
        data: { election: { ...graphElectionRaw17, id: 'not-a-number' } },
      });

      await expect(firstValueFrom(service.getElectionById(1))).rejects.toThrow('Invalid number');
    });
  });

  describe('getElections', () => {
    it('returns empty array when elections missing', async () => {
      queryMock.mockResolvedValue({ data: {} });
      await expect(firstValueFrom(service.getElections())).resolves.toEqual([]);
    });

    it('maps multiple elections', async () => {
      queryMock.mockResolvedValue({
        data: {
          elections: [
            { ...graphElectionRaw17, id: '17' },
            {
              ...graphElectionRaw17,
              id: '18',
              totalVotes: '0',
              registeredVoterCount: '0',
              authorizedVoterCount: '0',
            },
          ],
        },
      });

      const list = await firstValueFrom(service.getElections());
      expect(list.map((e) => e.id)).toEqual([17, 18]);
    });
  });

  describe('getResults', () => {
    it('returns null when no rows', async () => {
      queryMock.mockResolvedValue({ data: { electionResultsPublisheds: [] } });
      await expect(firstValueFrom(service.getResults(17))).resolves.toBeNull();
    });

    it('returns null when rows undefined', async () => {
      queryMock.mockResolvedValue({ data: {} });
      await expect(firstValueFrom(service.getResults(17))).resolves.toBeNull();
    });

    it('maps first row string tallies to VotesRecord', async () => {
      queryMock.mockResolvedValue({
        data: {
          electionResultsPublisheds: [
            {
              yesVotes: ['10', '20'],
              noVotes: ['3', '4'],
              invalidVotes: ['0', '1'],
            },
          ],
        },
      });

      const r = await firstValueFrom(service.getResults(17));
      expect(r).toEqual({
        0: { yesVotes: 10, noVotes: 3, invalidVotes: 0 },
        1: { yesVotes: 20, noVotes: 4, invalidVotes: 1 },
      });
    });

    it('returns null when min array length is 0', async () => {
      queryMock.mockResolvedValue({
        data: {
          electionResultsPublisheds: [
            {
              yesVotes: [],
              noVotes: ['1'],
              invalidVotes: ['0'],
            },
          ],
        },
      });
      await expect(firstValueFrom(service.getResults(17))).resolves.toBeNull();
    });

    it('returns null on query failure (catchError)', async () => {
      queryMock.mockRejectedValue(new Error('network'));
      await expect(firstValueFrom(service.getResults(99))).resolves.toBeNull();
    });
  });
});
