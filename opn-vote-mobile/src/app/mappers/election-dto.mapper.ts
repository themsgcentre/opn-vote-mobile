import { ElectionDTO } from '../interfaces/election-dto';

type RawElection = any;

const toNumber = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) throw new Error(`Invalid number: ${String(v)}`);
  return n;
};

export function parseElectionDTO(raw: RawElection): ElectionDTO {
  if (!raw) throw new Error('Election is null/undefined');
  return {
    id: toNumber(raw.id),
    descriptionBlob: String(raw.descriptionBlob ?? ''),
    descriptionIpfsCid: String(raw.descriptionIpfsCid ?? ''),
    authorizedVoterCount: toNumber(raw.authorizedVoterCount),
    privateKey: raw.privateKey ?? null,
    publicKey: String(raw.publicKey ?? ''),
    registerPublicKeyE: String(raw.registerPublicKeyE ?? ''),
    registerPublicKeyN: String(raw.registerPublicKeyN ?? ''),
    registeredVoterCount: toNumber(raw.registeredVoterCount),
    registrationEndTime: toNumber(raw.registrationEndTime),
    registrationStartTime: toNumber(raw.registrationStartTime),
    status: toNumber(raw.status),
    totalVotes: toNumber(raw.totalVotes),
    transactionHash: String(raw.transactionHash ?? ''),
    votingEndTime: toNumber(raw.votingEndTime),
    // votingStartTime: Math.floor(Date.now() / 1000) + 120, // use this for simulation TODO: remove after testing phase
    //votingStartTime: new Date('2026-04-02T12:45:00').getTime() / 1000, 
    votingStartTime: toNumber(raw.votingStartTime),
  };
}