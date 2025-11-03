export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    phone: string;
    preferences: {
        interests?: string[];
        travelStyle?: 'budget' | 'comfort' | 'luxury';
        preferredActivities?: string[];
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
