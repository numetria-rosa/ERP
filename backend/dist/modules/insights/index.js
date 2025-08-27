"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const insightsService_1 = __importDefault(require("../../services/insightsService"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get KPI insights
router.get('/kpi', async (req, res) => {
    try {
        const insights = await insightsService_1.default.getKPIAnalysis();
        res.json(insights);
    }
    catch (error) {
        console.error('KPI insights error:', error);
        res.status(500).json({ message: 'Failed to get KPI insights' });
    }
});
// Get cash flow forecast
router.get('/cashflow', async (req, res) => {
    try {
        const forecast = await insightsService_1.default.getCashFlowForecast();
        res.json(forecast);
    }
    catch (error) {
        console.error('Cash flow forecast error:', error);
        res.status(500).json({ message: 'Failed to get cash flow forecast' });
    }
});
// Get smart recommendations
router.get('/recommendations', async (req, res) => {
    try {
        const recommendations = await insightsService_1.default.getRecommendations();
        res.json(recommendations);
    }
    catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({ message: 'Failed to get recommendations' });
    }
});
// Get trend analysis for specific metric
router.get('/trends/:metric', async (req, res) => {
    try {
        const { metric } = req.params;
        const analysis = await insightsService_1.default.getTrendAnalysis(metric);
        res.json(analysis);
    }
    catch (error) {
        console.error('Trend analysis error:', error);
        res.status(500).json({ message: 'Failed to get trend analysis' });
    }
});
exports.default = router;
