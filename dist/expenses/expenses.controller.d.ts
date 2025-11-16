import { ExpensesService } from './expenses.service';
import type { CreateExpenseDto, UpdateExpenseDto } from './expenses.service';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(createExpenseDto: CreateExpenseDto): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/expense.entity").Expense;
    }>;
    findAllByTrip(tripId: string): Promise<{
        success: boolean;
        data: import("./entities/expense.entity").Expense[];
    }>;
    getTotalByTrip(tripId: string): Promise<{
        success: boolean;
        data: {
            total: number;
        };
    }>;
    getSummary(tripId: string): Promise<{
        success: boolean;
        data: any[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("./entities/expense.entity").Expense;
    }>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/expense.entity").Expense;
    }>;
    remove(id: string): Promise<void>;
}
