export interface ElectionDTO {
    id: number;
    title: string;
    imageUrl: string | undefined;
    category: string;
    country: string;
    endDate: Date | undefined;
    numberOfVotes: number;
}