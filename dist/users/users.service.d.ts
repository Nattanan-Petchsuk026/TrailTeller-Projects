import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(userData: {
        email: string;
        password: string;
        name: string;
        phone?: string;
    }): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    update(id: string, updateData: Partial<User>): Promise<User>;
    validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    findOneSecure(id: string): Promise<Omit<User, 'password'> | null>;
    private excludePassword;
}
