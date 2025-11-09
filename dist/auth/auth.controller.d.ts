import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { RequestWithUser } from '../types/request-with-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    getProfile(req: RequestWithUser): {
        success: boolean;
        data: import("../types/jwt-payload.interface").JwtPayload;
    };
    updateProfile(req: RequestWithUser, updateProfileDto: UpdateProfileDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
    }>;
}
