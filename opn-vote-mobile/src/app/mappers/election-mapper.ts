import { ElectionDTO } from '../interfaces/election-dto';
import { Election } from '../interfaces/election';
import { DescriptionBlob } from '../interfaces/description-blob';

const toDateFromSeconds = (seconds: number | string): Date => {
  const n = typeof seconds === 'number' ? seconds : Number(seconds);
  return new Date(n * 1000);
};

export function mapElection(dto: ElectionDTO): Election {
  const blob: DescriptionBlob = JSON.parse(dto.descriptionBlob);

  return {
    id: dto.id,

    title: blob.title,
    summary: blob.summary,
    description: blob.description,

    headerImage: blob.headerImage,
    questions: blob.questions,

    backLink: blob.backLink,
    author: blob.author,
    authorWalletAddress: blob.authorWalletAddress,

    authorizedVoterCount: dto.authorizedVoterCount,
    registeredVoterCount: dto.registeredVoterCount,
    totalVotes: dto.totalVotes,

    registrationStart: toDateFromSeconds(dto.registrationStartTime),
    registrationEnd: toDateFromSeconds(dto.registrationEndTime),

    votingStart: toDateFromSeconds(dto.votingStartTime),
    votingEnd: toDateFromSeconds(dto.votingEndTime),

    status: dto.status,
    transactionHash: dto.transactionHash,
  };
}