import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
export interface CreateFavoriteDto {
    userId: string;
    destination: string;
    country?: string;
    description?: string;
    imageUrl?: string;
    tags?: string[];
    aiSuggestions?: any;
}
export declare class FavoritesService {
    private favoriteRepository;
    constructor(favoriteRepository: Repository<Favorite>);
    create(createFavoriteDto: CreateFavoriteDto): Promise<Favorite>;
    findAllByUser(userId: string): Promise<Favorite[]>;
    findOne(id: string, userId: string): Promise<Favorite>;
    remove(id: string, userId: string): Promise<void>;
    checkExists(userId: string, destination: string): Promise<boolean>;
    countByUser(userId: string): Promise<number>;
}
