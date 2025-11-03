import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
            preferences: {
                interests?: string[];
                travelStyle?: "budget" | "comfort" | "luxury";
                preferredActivities?: string[];
            };
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
            preferences: {
                interests?: string[];
                travelStyle?: "budget" | "comfort" | "luxury";
                preferredActivities?: string[];
            };
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
    }>;
    validateToken(token: string): Promise<Omit<import("../users/entities/user.entity").User, "password">>;
}
