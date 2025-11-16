import { Repository } from 'typeorm';
import { Expense, ExpenseCategory } from './entities/expense.entity';
export interface CreateExpenseDto {
    tripId: string;
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    notes?: string;
}
export interface UpdateExpenseDto {
    title?: string;
    amount?: number;
    category?: ExpenseCategory;
    date?: string;
    notes?: string;
}
export declare class ExpensesService {
    private expenseRepository;
    constructor(expenseRepository: Repository<Expense>);
    create(createExpenseDto: CreateExpenseDto): Promise<Expense>;
    findAllByTrip(tripId: string): Promise<Expense[]>;
    findOne(id: string): Promise<Expense>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense>;
    remove(id: string): Promise<void>;
    getTotalByTrip(tripId: string): Promise<number>;
    getSummaryByCategory(tripId: string): Promise<any[]>;
}
