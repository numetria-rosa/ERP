import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import insightsService from '../../services/insightsService';

const router = Router();
const prisma = new PrismaClient();

// Get KPI insights
router.get('/kpi', async (req, res) => {
  try {
    const insights = await insightsService.getKPIAnalysis();
    res.json(insights);
  } catch (error) {
    console.error('KPI insights error:', error);
    res.status(500).json({ message: 'Failed to get KPI insights' });
  }
});

// Get cash flow forecast
router.get('/cashflow', async (req, res) => {
  try {
    const forecast = await insightsService.getCashFlowForecast();
    res.json(forecast);
  } catch (error) {
    console.error('Cash flow forecast error:', error);
    res.status(500).json({ message: 'Failed to get cash flow forecast' });
  }
});

// Get smart recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = await insightsService.getRecommendations();
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

// Get trend analysis for specific metric
router.get('/trends/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const analysis = await insightsService.getTrendAnalysis(metric);
    res.json(analysis);
  } catch (error) {
    console.error('Trend analysis error:', error);
    res.status(500).json({ message: 'Failed to get trend analysis' });
  }
});

export default router; 