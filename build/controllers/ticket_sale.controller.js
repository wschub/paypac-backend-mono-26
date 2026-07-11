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
exports.acceptOffer = exports.getOffers = exports.placeOffer = exports.getMyListings = exports.cancelListing = exports.createListing = void 0;
const ticket_sale_service_1 = require("../services/ticket_sale.service");
const saleService = new ticket_sale_service_1.TicketSaleService();
const createListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketId = parseInt(req.params.id);
        const sellerId = req.user.id;
        const listing = yield saleService.createListing(ticketId, sellerId, req.body);
        res.status(201).json({ listing });
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.createListing = createListing;
const cancelListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listingId = parseInt(req.params.listingId);
        const sellerId = req.user.id;
        const result = yield saleService.cancelListing(listingId, sellerId);
        res.status(200).json(result);
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.cancelListing = cancelListing;
const getMyListings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerId = req.user.id;
        const listings = yield saleService.getMyListings(sellerId);
        res.status(200).json({ listings });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getMyListings = getMyListings;
const placeOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listingId = parseInt(req.params.listingId);
        const buyerId = req.user.id;
        const { amount } = req.body;
        const offer = yield saleService.placeOffer(listingId, buyerId, amount);
        res.status(201).json({ offer });
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.placeOffer = placeOffer;
const getOffers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listingId = parseInt(req.params.listingId);
        const sellerId = req.user.id;
        const offers = yield saleService.getOffers(listingId, sellerId);
        res.status(200).json({ offers });
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.getOffers = getOffers;
const acceptOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listingId = parseInt(req.params.listingId);
        const offerId = parseInt(req.params.offerId);
        const sellerId = req.user.id;
        const result = yield saleService.acceptOffer(listingId, offerId, sellerId);
        res.status(200).json(result);
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.acceptOffer = acceptOffer;
function _handleError(res, error) {
    var _a;
    console.error('TicketSale error:', error);
    const msg = (_a = error.message) !== null && _a !== void 0 ? _a : '';
    if (msg.includes('no encontrad'))
        return res.status(404).json({ error: 'Not found', message: msg });
    if (msg.includes('permiso') || msg.includes('dueño') || msg.includes('Solo el')) {
        return res.status(403).json({ error: 'Forbidden', message: msg });
    }
    res.status(409).json({ error: 'Conflict', message: msg });
}
