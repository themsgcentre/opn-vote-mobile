export interface PetitionDTO {
    id: number;
    title: string;
    imageUrl: string | undefined;
    category: string;
    country: string;
    endDate: Date | undefined;
    numberOfVotes: number;
}