"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyFollowersService = void 0;
const company_followers_repository_1 = require("../repositories/company_followers.repository");
const db_1 = require("../config/db");
const followersRepo = new company_followers_repository_1.CompanyFollowersRepository();
class CompanyFollowersService {
    followCompany(companyId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const company = yield db_1.prisma.company.findUnique({ where: { id: companyId } });
            if (!company)
                throw new Error('Empresa no encontrada');
            const already = yield followersRepo.isFollowing(companyId, userId);
            if (already)
                throw new Error('Ya sigues a esta empresa');
            const follow = yield followersRepo.follow(companyId, userId);
            return { follow, message: `Ahora sigues a ${company.company_name}` };
        });
    }
    unfollowCompany(companyId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const company = yield db_1.prisma.company.findUnique({ where: { id: companyId } });
            if (!company)
                throw new Error('Empresa no encontrada');
            const following = yield followersRepo.isFollowing(companyId, userId);
            if (!following)
                throw new Error('No sigues a esta empresa');
            yield followersRepo.unfollow(companyId, userId);
            return { message: `Dejaste de seguir a ${company.company_name}` };
        });
    }
    getCompanyFollowers(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const company = yield db_1.prisma.company.findUnique({ where: { id: companyId } });
            if (!company)
                throw new Error('Empresa no encontrada');
            const followers = yield followersRepo.findByCompany(companyId);
            const total = yield followersRepo.countByCompany(companyId);
            return { total, followers };
        });
    }
    getFollowing(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const following = yield followersRepo.findByUser(userId);
            return { total: following.length, following };
        });
    }
    isFollowing(companyId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return followersRepo.isFollowing(companyId, userId);
        });
    }
}
exports.CompanyFollowersService = CompanyFollowersService;
