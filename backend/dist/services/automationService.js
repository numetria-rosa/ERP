"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const emailService_1 = __importDefault(require("./emailService"));
const prisma = new client_1.PrismaClient();
class AutomationService {
    constructor() {
        this.initializeCronJobs();
    }
    initializeCronJobs() {
        // Daily at 9 AM - Check attendance and send reminders
        node_cron_1.default.schedule('0 9 * * *', () => {
            this.checkAttendanceAndSendReminders();
        });
        // Daily at 10 AM - Check low stock and send alerts
        node_cron_1.default.schedule('0 10 * * *', () => {
            this.checkLowStockAndSendAlerts();
        });
        // Daily at 11 AM - Check overdue invoices and send reminders
        node_cron_1.default.schedule('0 11 * * *', () => {
            this.checkOverdueInvoicesAndSendReminders();
        });
        // Daily at 2 PM - Check late tasks and send reminders
        node_cron_1.default.schedule('0 14 * * *', () => {
            this.checkLateTasksAndSendReminders();
        });
        // Monthly on 1st at 6 AM - Generate payroll
        node_cron_1.default.schedule('0 6 1 * *', () => {
            this.generateMonthlyPayroll();
        });
        // Daily at 8 AM - Process recurring invoices
        node_cron_1.default.schedule('0 8 * * *', () => {
            this.processRecurringInvoices();
        });
        console.log('Automation service initialized with cron jobs');
    }
    async checkAttendanceAndSendReminders() {
        try {
            const today = new Date();
            const employees = await prisma.employee.findMany({
                where: { status: 'active' }
            });
            for (const employee of employees) {
                const attendance = await prisma.attendance.findFirst({
                    where: {
                        employeeId: employee.id,
                        date: {
                            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                            lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
                        }
                    }
                });
                if (!attendance) {
                    // Send attendance reminder
                    await emailService_1.default.sendAttendanceReminder(employee.id);
                    // Create alert
                    await this.createAlert({
                        type: 'missed_attendance',
                        title: 'Missed Attendance',
                        message: `${employee.firstName} ${employee.lastName} hasn't checked in today`,
                        severity: 'medium',
                        targetId: employee.id,
                        targetType: 'employee'
                    });
                }
            }
        }
        catch (error) {
            console.error('Error checking attendance:', error);
        }
    }
    async checkLowStockAndSendAlerts() {
        try {
            const products = await prisma.product.findMany({
                include: { stock: true }
            });
            for (const product of products) {
                const totalStock = product.stock.reduce((sum, stock) => sum + stock.quantity, 0);
                if (totalStock <= product.lowStockThreshold) {
                    // Send low stock alert
                    await emailService_1.default.sendLowStockAlert(product.id);
                    // Create alert
                    await this.createAlert({
                        type: 'low_stock',
                        title: 'Low Stock Alert',
                        message: `${product.name} is running low on stock (${totalStock} remaining)`,
                        severity: totalStock === 0 ? 'critical' : 'high',
                        targetId: product.id,
                        targetType: 'product'
                    });
                }
            }
        }
        catch (error) {
            console.error('Error checking low stock:', error);
        }
    }
    async checkOverdueInvoicesAndSendReminders() {
        try {
            const overdueInvoices = await prisma.invoice.findMany({
                where: {
                    status: 'sent',
                    dueDate: {
                        lt: new Date()
                    }
                },
                include: { customer: true }
            });
            for (const invoice of overdueInvoices) {
                // Send invoice reminder
                await emailService_1.default.sendInvoiceReminder(invoice.id);
                // Update invoice status to overdue
                await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { status: 'overdue' }
                });
                // Create alert
                await this.createAlert({
                    type: 'overdue_invoice',
                    title: 'Overdue Invoice',
                    message: `Invoice #${invoice.id} for ${invoice.customer.name} is overdue`,
                    severity: 'high',
                    targetId: invoice.id,
                    targetType: 'invoice'
                });
            }
        }
        catch (error) {
            console.error('Error checking overdue invoices:', error);
        }
    }
    async checkLateTasksAndSendReminders() {
        try {
            const lateTasks = await prisma.task.findMany({
                where: {
                    status: { not: 'completed' },
                    dueDate: {
                        lt: new Date()
                    }
                },
                include: {
                    assignedTo: true,
                    project: true
                }
            });
            for (const task of lateTasks) {
                if (task.assignedTo) {
                    // Send task reminder
                    await emailService_1.default.sendTaskReminder(task.id);
                    // Create alert
                    await this.createAlert({
                        type: 'late_task',
                        title: 'Late Task',
                        message: `Task "${task.name}" assigned to ${task.assignedTo.firstName} ${task.assignedTo.lastName} is overdue`,
                        severity: 'high',
                        targetId: task.id,
                        targetType: 'task'
                    });
                }
            }
        }
        catch (error) {
            console.error('Error checking late tasks:', error);
        }
    }
    async generateMonthlyPayroll() {
        try {
            const employees = await prisma.employee.findMany({
                where: { status: 'active' }
            });
            const currentDate = new Date();
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
            for (const employee of employees) {
                // Calculate attendance for the month
                const attendances = await prisma.attendance.findMany({
                    where: {
                        employeeId: employee.id,
                        date: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                });
                // Calculate total hours worked
                const totalHours = attendances.reduce((sum, attendance) => {
                    return sum + (attendance.hoursWorked || 0);
                }, 0);
                // Calculate overtime (assuming 40 hours per week standard)
                const standardHours = 160; // 40 hours * 4 weeks
                const overtime = Math.max(0, totalHours - standardHours);
                // Calculate payroll
                const baseSalary = employee.salary || 0;
                const hourlyRate = employee.hourlyRate || (baseSalary / 160);
                const overtimePay = overtime * hourlyRate * 1.5; // 1.5x for overtime
                const deductions = 0; // Could be calculated based on benefits, taxes, etc.
                const bonuses = 0; // Could be calculated based on performance
                const netPay = baseSalary + overtimePay + bonuses - deductions;
                // Create payroll record
                const payroll = await prisma.payroll.create({
                    data: {
                        employeeId: employee.id,
                        amount: netPay,
                        baseSalary,
                        overtime: overtimePay,
                        deductions,
                        bonuses,
                        period: 'monthly',
                        startDate,
                        endDate,
                        status: 'pending'
                    }
                });
                // Send payroll notification
                await emailService_1.default.sendPayrollNotification(employee.id, {
                    baseSalary,
                    overtime: overtimePay,
                    bonuses,
                    deductions,
                    amount: netPay
                });
                console.log(`Payroll generated for ${employee.firstName} ${employee.lastName}: $${netPay}`);
            }
        }
        catch (error) {
            console.error('Error generating payroll:', error);
        }
    }
    async processRecurringInvoices() {
        try {
            const recurringInvoices = await prisma.recurringInvoice.findMany({
                where: {
                    status: 'active',
                    nextDueDate: {
                        lte: new Date()
                    }
                },
                include: { customer: true }
            });
            for (const recurringInvoice of recurringInvoices) {
                // Create new invoice
                const newInvoice = await prisma.invoice.create({
                    data: {
                        customerId: recurringInvoice.customerId,
                        amount: recurringInvoice.amount,
                        date: new Date(),
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                        status: 'draft',
                        recurringInvoiceId: recurringInvoice.id
                    }
                });
                // Calculate next due date
                let nextDueDate;
                switch (recurringInvoice.frequency) {
                    case 'monthly':
                        nextDueDate = new Date(recurringInvoice.nextDueDate);
                        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                        break;
                    case 'quarterly':
                        nextDueDate = new Date(recurringInvoice.nextDueDate);
                        nextDueDate.setMonth(nextDueDate.getMonth() + 3);
                        break;
                    case 'yearly':
                        nextDueDate = new Date(recurringInvoice.nextDueDate);
                        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                        break;
                    default:
                        nextDueDate = new Date(recurringInvoice.nextDueDate);
                        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                }
                // Update recurring invoice
                await prisma.recurringInvoice.update({
                    where: { id: recurringInvoice.id },
                    data: { nextDueDate }
                });
                console.log(`Recurring invoice created: #${newInvoice.id} for ${recurringInvoice.customer.name}`);
            }
        }
        catch (error) {
            console.error('Error processing recurring invoices:', error);
        }
    }
    async createAlert(alertData) {
        try {
            await prisma.alert.create({
                data: {
                    type: alertData.type,
                    title: alertData.title,
                    message: alertData.message,
                    severity: alertData.severity,
                    targetId: alertData.targetId,
                    targetType: alertData.targetType,
                    status: 'active'
                }
            });
        }
        catch (error) {
            console.error('Error creating alert:', error);
        }
    }
    // Manual trigger methods for testing
    async triggerPayrollGeneration() {
        await this.generateMonthlyPayroll();
    }
    async triggerRecurringInvoices() {
        await this.processRecurringInvoices();
    }
    async triggerAttendanceCheck() {
        await this.checkAttendanceAndSendReminders();
    }
    async triggerLowStockCheck() {
        await this.checkLowStockAndSendAlerts();
    }
}
exports.default = new AutomationService();
