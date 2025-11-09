import { FavoritesService } from './favorites.service';
import type { CreateFavoriteDto } from './favorites.service';
import type { RequestWithUser } from '../types/request-with-user.interface';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    create(createFavoriteDto: Omit<CreateFavoriteDto, 'userId'>, req: RequestWithUser): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/favorite.entity").Favorite;
    }>;
    findAll(req: RequestWithUser): Promise<{
        success: boolean;
        data: import("./entities/favorite.entity").Favorite[];
    }>;
    count(req: RequestWithUser): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
    checkExists(destination: string, req: RequestWithUser): Promise<{
        success: boolean;
        data: {
            exists: boolean;
        };
    }>;
    findOne(id: string, req: RequestWithUser): Promise<{
        success: boolean;
        data: import("./entities/favorite.entity").Favorite;
    }>;
    remove(id: string, req: RequestWithUser): Promise<void>;
}
