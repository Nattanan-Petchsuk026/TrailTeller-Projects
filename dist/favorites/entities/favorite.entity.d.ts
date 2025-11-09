import { User } from '../../users/entities/user.entity';
export declare class Favorite {
    id: string;
    userId: string;
    destination: string;
    country: string;
    description: string;
    imageUrl: string;
    tags: string[];
    aiSuggestions: {
        bestTime?: string;
        estimatedBudget?: number;
        duration?: number;
        highlights?: string[];
    };
    createdAt: Date;
    user: User;
}
