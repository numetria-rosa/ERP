"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const automationService_1 = __importDefault(require("../../services/automationService"));
const insightsService_1 = __importDefault(require("../../services/insightsService"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all alerts
router.get('/alerts', async (req, res) => {
    try {
        const alerts = await prisma.alert.findMany({
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(alerts);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});
// Resolve alert
router.patch('/alerts/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await prisma.alert.update({
            where: { id: parseInt(id) },
            data: {
                status: 'resolved',
                resolvedAt: new Date(),
                resolvedBy: null,
            }
        });
        res.json(alert);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to resolve alert' });
    }
});
// Get cash flow forecast
router.get('/insights/cash-flow-forecast', async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 6;
        const forecast = await insightsService_1.default.getCashFlowForecast(months);
        res.json(forecast);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate cash flow forecast' });
    }
});
// Get most profitable customers
router.get('/insights/profitable-customers', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const customers = await insightsService_1.default.getMostProfitableCustomers(limit);
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch profitable customers' });
    }
});
// Get KPI analysis
router.get('/insights/kpi-analysis', async (req, res) => {
    try {
        const kpis = await insightsService_1.default.getKPIAnalysis();
        res.json(kpis);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate KPI analysis' });
    }
});
// Get employee performance insights
router.get('/insights/employee-performance', async (req, res) => {
    try {
        const performance = await insightsService_1.default.getEmployeePerformanceInsights();
        res.json(performance);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch employee performance' });
    }
});
// Get inventory insights
router.get('/insights/inventory', async (req, res) => {
    try {
        const insights = await insightsService_1.default.getInventoryInsights();
        res.json(insights);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory insights' });
    }
});
// Manual trigger endpoints for testing
router.post('/trigger/payroll', async (req, res) => {
    try {
        await automationService_1.default.triggerPayrollGeneration();
        res.json({ message: 'Payroll generation triggered successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to trigger payroll generation' });
    }
});
router.post('/trigger/recurring-invoices', async (req, res) => {
    try {
        await automationService_1.default.triggerRecurringInvoices();
        res.json({ message: 'Recurring invoices processed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process recurring invoices' });
    }
});
router.post('/trigger/attendance-check', async (req, res) => {
    try {
        await automationService_1.default.triggerAttendanceCheck();
        res.json({ message: 'Attendance check triggered successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to trigger attendance check' });
    }
});
router.post('/trigger/low-stock-check', async (req, res) => {
    try {
        await automationService_1.default.triggerLowStockCheck();
        res.json({ message: 'Low stock check triggered successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to trigger low stock check' });
    }
});
// Get email templates
router.get('/email-templates', async (req, res) => {
    try {
        const templates = await prisma.emailTemplate.findMany({
            where: { isActive: true }
        });
        res.json(templates);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch email templates' });
    }
});
// Create/update email template
router.post('/email-templates', async (req, res) => {
    try {
        const { name, subject, body, variables } = req.body;
        const template = await prisma.emailTemplate.upsert({
            where: { name },
            update: { subject, body, variables: JSON.stringify(variables) },
            create: { name, subject, body, variables: JSON.stringify(variables), isActive: true }
        });
        res.json(template);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to save email template' });
    }
});
// Get email logs
router.get('/email-logs', async (req, res) => {
    try {
        const logs = await prisma.emailLog.findMany({
            orderBy: { sentAt: 'desc' },
            take: 100
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch email logs' });
    }
});
// Create recurring invoice
router.post('/recurring-invoices', async (req, res) => {
    try {
        const { customerId, amount, frequency, startDate, endDate } = req.body;
        const recurringInvoice = await prisma.recurringInvoice.create({
            data: {
                customerId,
                amount,
                frequency,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                nextDueDate: new Date(startDate),
                status: 'active'
            },
            include: { customer: true }
        });
        res.json(recurringInvoice);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create recurring invoice' });
    }
});
// Get recurring invoices
router.get('/recurring-invoices', async (req, res) => {
    try {
        const recurringInvoices = await prisma.recurringInvoice.findMany({
            include: { customer: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(recurringInvoices);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch recurring invoices' });
    }
});
// Update recurring invoice
router.patch('/recurring-invoices/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, nextDueDate } = req.body;
        const recurringInvoice = await prisma.recurringInvoice.update({
            where: { id: parseInt(id) },
            data: {
                status,
                nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined
            },
            include: { customer: true }
        });
        res.json(recurringInvoice);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update recurring invoice' });
    }
});
exports.default = router;
