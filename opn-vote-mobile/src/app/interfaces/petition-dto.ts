export interface PetitionDTO {
    title: string;
    imageUrl: string | undefined;
    category: string;
    country: string;
    endDate: Date;
    numberOfVotes: number;
}