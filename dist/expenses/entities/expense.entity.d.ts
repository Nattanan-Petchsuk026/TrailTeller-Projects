import { Trip } from '../../trips/entities/trip.entity';
export declare enum ExpenseCategory {
    ACCOMMODATION = "accommodation",
    FOOD = "food",
    TRANSPORT = "transport",
    ACTIVITIES = "activities",
    SHOPPING = "shopping",
    OTHERS = "others"
}
export declare class Expense {
    id: string;
    tripId: string;
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: Date;
    notes: string;
    createdAt: Date;
    trip: Trip;
}
