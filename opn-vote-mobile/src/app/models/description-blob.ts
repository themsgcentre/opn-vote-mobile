export interface DescriptionBlob {
  title: string;
  headerImage: {
    large: string;
    small: string;
  };
  description: string;
  summary: string;
  registrationStartTime: string;
  registrationEndTime: string;
  questions: {
    text: string;
    imageUrl: string;
  }[];
  backLink: string;
  author: string;
  authorWalletAddress: string;
}