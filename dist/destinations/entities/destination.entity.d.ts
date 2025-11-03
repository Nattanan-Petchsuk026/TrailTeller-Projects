export declare class Destination {
    id: string;
    name: string;
    country: string;
    description: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    bestSeasons: string[];
    activities: string[];
    averageCost: number;
    weatherInfo: {
        month: number;
        avgTemp: number;
        rainfall: number;
        condition: string;
    }[];
    tags: string[];
    popularityScore: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
