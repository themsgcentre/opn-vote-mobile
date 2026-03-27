import { ElectionDTO } from '../interfaces/election-dto';
import { ElectionInformation } from '../interfaces/election';
import { DescriptionBlob } from '../interfaces/description-blob';
import { ElectionPdfInformation } from '../qr-code/election-pdf-info';
import { UrlPaths } from '../globals/url';
import { formatDate } from '../formatting/date-formatting';

const toDateFromSeconds = (seconds: number | string): Date => {
  const n = typeof seconds === 'number' ? seconds : Number(seconds);
  return new Date(n * 1000);
};

export function mapElectionInformation(dto: ElectionDTO): ElectionInformation {
  const blob: DescriptionBlob = JSON.parse(dto.descriptionBlob);

  return {
    id: dto.id,

    title: blob.title,
    summary: blob.summary,
    description: blob.description,

    headerImage: blob.headerImage,

    backLink: blob.backLink,
    author: blob.author,

    authorizedVoterCount: dto.authorizedVoterCount,
    registeredVoterCount: dto.registeredVoterCount,
    totalVotes: dto.totalVotes,

    registrationStart: toDateFromSeconds(dto.registrationStartTime),
    registrationEnd: toDateFromSeconds(dto.registrationEndTime),

    votingStart: toDateFromSeconds(dto.votingStartTime),
    votingEnd: toDateFromSeconds(dto.votingEndTime),

    status: dto.status,
  };
}