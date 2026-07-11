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
exports.checkIsFollowing = exports.getFollowing = exports.getCompanyFollowers = exports.unfollowCompany = exports.followCompany = void 0;
const company_followers_service_1 = require("../services/company_followers.service");
const followersService = new company_followers_service_1.CompanyFollowersService();
const followCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = Number(req.params.companyId);
        const userId = req.user.id;
        const result = yield followersService.followCompany(companyId, userId);
        res.status(201).json(result);
    }
    catch (err) {
        const status = err.message.includes('no encontrada') ? 404
            : err.message.includes('Ya sigues') ? 409 : 500;
        res.status(status).json({ message: err.message });
    }
});
exports.followCompany = followCompany;
const unfollowCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = Number(req.params.companyId);
        const userId = req.user.id;
        const result = yield followersService.unfollowCompany(companyId, userId);
        res.status(200).json(result);
    }
    catch (err) {
        const status = err.message.includes('no encontrada') ? 404
            : err.message.includes('No sigues') ? 409 : 500;
        res.status(status).json({ message: err.message });
    }
});
exports.unfollowCompany = unfollowCompany;
const getCompanyFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = Number(req.params.companyId);
        const result = yield followersService.getCompanyFollowers(companyId);
        res.status(200).json(result);
    }
    catch (err) {
        const status = err.message.includes('no encontrada') ? 404 : 500;
        res.status(status).json({ message: err.message });
    }
});
exports.getCompanyFollowers = getCompanyFollowers;
const getFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const result = yield followersService.getFollowing(userId);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getFollowing = getFollowing;
const checkIsFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = Number(req.params.companyId);
        const userId = req.user.id;
        const isFollowing = yield followersService.isFollowing(companyId, userId);
        res.status(200).json({ is_following: isFollowing });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.checkIsFollowing = checkIsFollowing;
