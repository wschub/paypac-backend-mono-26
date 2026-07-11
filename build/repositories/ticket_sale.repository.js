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
exports.TicketSaleRepository = void 0;
const client_1 = require("../prisma/client");
const listingInclude = {
    ticket: true,
    seller: { select: { id: true, name: true, lastname: true } },
    buyer: { select: { id: true, name: true, lastname: true } },
    offers: {
        where: { status: 'PENDING' },
        select: { id: true, amount: true, createdAt: true }, // no expone buyer_id
        orderBy: { amount: 'desc' },
    },
};
class TicketSaleRepository {
    // ── Listings ───────────────────────────────────────────────────────────────
    createListing(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketSaleListing.create({ data, include: listingInclude });
        });
    }
    findListingById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketSaleListing.findUnique({ where: { id }, include: listingInclude });
        });
    }
    findActiveListingByTicket(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketSaleListing.findFirst({
                where: { ticket_id: ticketId, status: 'ACTIVE' },
            });
        });
    }
    findListingsBySeller(sellerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketSaleListing.findMany({
                where: { seller_id: sellerId },
                include: listingInclude,
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    updateListing(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketSaleListing.update({ where: { id }, data });
        });
    }
    findExpiredActive() {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketSaleListing.findMany({
                where: { status: 'ACTIVE', expires_at: { lt: new Date() } },
            });
        });
    }
    // ── Offers ─────────────────────────────────────────────────────────────────
    createOffer(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketSaleOffer.create({ data });
        });
    }
    findOfferById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketSaleOffer.findUnique({ where: { id } });
        });
    }
    findOffersByListing(listingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketSaleOffer.findMany({
                where: { listing_id: listingId, status: 'PENDING' },
                select: { id: true, amount: true, createdAt: true }, // no expone buyer_id
                orderBy: { amount: 'desc' },
            });
        });
    }
    findOfferByBuyerAndListing(buyerId, listingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketSaleOffer.findFirst({
                where: { buyer_id: buyerId, listing_id: listingId, status: 'PENDING' },
            });
        });
    }
    updateOfferStatus(id, status, notifiedAt) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketSaleOffer.update({
                where: { id },
                data: Object.assign({ status }, (notifiedAt ? { notified_to_pay_at: notifiedAt } : {})),
            });
        });
    }
    rejectOtherOffers(listingId, acceptedOfferId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield client_1.prisma.ticketSaleOffer.updateMany({
                where: { listing_id: listingId, status: 'PENDING', id: { not: acceptedOfferId } },
                data: { status: 'REJECTED' },
            });
        });
    }
}
exports.TicketSaleRepository = TicketSaleRepository;
