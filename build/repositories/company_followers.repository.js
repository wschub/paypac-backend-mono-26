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
exports.CompanyFollowersRepository = void 0;
const db_1 = require("../config/db");
class CompanyFollowersRepository {
    follow(company_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.companyFollwers.create({
                data: { company_id, user_id },
            });
        });
    }
    unfollow(company_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.companyFollwers.deleteMany({
                where: { company_id, user_id },
            });
        });
    }
    isFollowing(company_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.companyFollwers.count({
                where: { company_id, user_id },
            });
            return count > 0;
        });
    }
    findByCompany(company_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.companyFollwers.findMany({
                where: { company_id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            last_name: true,
                            email: true,
                            phone_number: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    findByUser(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.companyFollwers.findMany({
                where: { user_id },
                include: {
                    company: {
                        select: {
                            id: true,
                            company_name: true,
                            company_logo: true,
                            company_description: true,
                            rating: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    countByCompany(company_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.companyFollwers.count({ where: { company_id } });
        });
    }
}
exports.CompanyFollowersRepository = CompanyFollowersRepository;
