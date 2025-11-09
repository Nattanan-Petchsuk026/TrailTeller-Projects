"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const favorite_entity_1 = require("./entities/favorite.entity");
let FavoritesService = class FavoritesService {
    favoriteRepository;
    constructor(favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }
    async create(createFavoriteDto) {
        const favorite = this.favoriteRepository.create(createFavoriteDto);
        return await this.favoriteRepository.save(favorite);
    }
    async findAllByUser(userId) {
        return await this.favoriteRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const favorite = await this.favoriteRepository.findOne({
            where: { id, userId },
        });
        if (!favorite) {
            throw new common_1.NotFoundException('ไม่พบสถานที่โปรดนี้');
        }
        return favorite;
    }
    async remove(id, userId) {
        const favorite = await this.findOne(id, userId);
        await this.favoriteRepository.remove(favorite);
    }
    async checkExists(userId, destination) {
        const count = await this.favoriteRepository.count({
            where: { userId, destination },
        });
        return count > 0;
    }
    async countByUser(userId) {
        return await this.favoriteRepository.count({
            where: { userId },
        });
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(favorite_entity_1.Favorite)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map