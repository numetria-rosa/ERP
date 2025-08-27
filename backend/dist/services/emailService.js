"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const client_1 = require("@prisma/client");
const handlebars_1 = __importDefault(require("handlebars"));
const prisma = new client_1.PrismaClient();
class EmailService {
    constructor() {
        this.templates = new Map();
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        this.loadTemplates();
    }
    async loadTemplates() {
        // Load default templates
        const defaultTemplates = [
            {
                name: 'payroll_notification',
                subject: 'Your Payroll Statement - {{month}} {{year}}',
                body: String.raw `
          <h2>Payroll Statement</h2>
          <p>Dear {{employeeName}},</p>
          <p>Your payroll for {{month}} {{year}} has been processed.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Payroll Summary</h3>
            <p><strong>Base Salary:</strong> \${{baseSalary}}</p>
            <p><strong>Overtime:</strong> \${{overtime}}</p>
            <p><strong>Bonuses:</strong> \${{bonuses}}</p>
            <p><strong>Deductions:</strong> \${{deductions}}</p>
            <hr>
            <p><strong>Net Pay:</strong> \${{netPay}}</p>
          </div>
          <p>Thank you for your hard work!</p>
        `,
                variables: [
                    'employeeName',
                    'month',
                    'year',
                    'baseSalary',
                    'overtime',
                    'bonuses',
                    'deductions',
                    'netPay',
                    'amount'
                ]
            },
            {
                name: 'invoice_reminder',
                subject: 'Invoice Reminder - {{invoiceNumber}}',
                body: String.raw `
          <h2>Invoice Reminder</h2>
          <p>Dear {{customerName}},</p>
          <p>This is a friendly reminder about your outstanding invoice.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Invoice Details</h3>
            <p><strong>Invoice #:</strong> {{invoiceNumber}}</p>
            <p><strong>Amount:</strong> \${{amount}}</p>
            <p><strong>Due Date:</strong> {{dueDate}}</p>
            <p><strong>Days Overdue:</strong> {{daysOverdue}}</p>
          </div>
          <p>Please process this payment at your earliest convenience.</p>
        `,
                variables: ['customerName', 'invoiceNumber', 'amount', 'dueDate', 'daysOverdue']
            },
            {
                name: 'low_stock_alert',
                subject: 'Low Stock Alert - {{productName}}',
                body: String.raw `
          <h2>Low Stock Alert</h2>
          <p>The following product is running low on stock:</p>
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3>{{productName}}</h3>
            <p><strong>Current Stock:</strong> {{currentStock}}</p>
            <p><strong>Minimum Threshold:</strong> {{minThreshold}}</p>
            <p><strong>SKU:</strong> {{sku}}</p>
          </div>
          <p>Please reorder this item soon to avoid stockouts.</p>
        `,
                variables: ['productName', 'currentStock', 'minThreshold', 'sku']
            },
            {
                name: 'task_reminder',
                subject: 'Task Reminder - {{taskName}}',
                body: String.raw `
          <h2>Task Reminder</h2>
          <p>Dear {{employeeName}},</p>
          <p>This is a reminder about your upcoming task:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>{{taskName}}</h3>
            <p><strong>Project:</strong> {{projectName}}</p>
            <p><strong>Due Date:</strong> {{dueDate}}</p>
            <p><strong>Priority:</strong> {{priority}}</p>
            <p><strong>Description:</strong> {{description}}</p>
          </div>
          <p>Please ensure this task is completed on time.</p>
        `,
                variables: ['employeeName', 'taskName', 'projectName', 'dueDate', 'priority', 'description']
            },
            {
                name: 'attendance_reminder',
                subject: 'Attendance Reminder',
                body: String.raw `
          <h2>Attendance Reminder</h2>
          <p>Dear {{employeeName}},</p>
          <p>We noticed you haven't checked in today. Please remember to:</p>
          <ul>
            <li>Check in when you arrive at work</li>
            <li>Check out when you leave</li>
            <li>Update your time entries for any breaks</li>
          </ul>
          <p>If you're having trouble with the system, please contact HR.</p>
        `,
                variables: ['employeeName']
            }
        ];
        for (const template of defaultTemplates) {
            await this.saveTemplate(template.name, template.subject, template.body, template.variables);
        }
    }
    async saveTemplate(name, subject, body, variables) {
        try {
            await prisma.emailTemplate.upsert({
                where: { name },
                update: {
                    subject,
                    body,
                    variables: JSON.stringify(variables),
                    isActive: true
                },
                create: {
                    name,
                    subject,
                    body,
                    variables: JSON.stringify(variables),
                    isActive: true
                }
            });
        }
        catch (error) {
            console.error(`Error saving template ${name}:`, error);
        }
    }
    async sendEmail(emailData) {
        try {
            // Get template from database
            const template = await prisma.emailTemplate.findFirst({
                where: { name: emailData.template, isActive: true }
            });
            if (!template) {
                throw new Error(`Template ${emailData.template} not found`);
            }
            // Compile template
            const compiledSubject = handlebars_1.default.compile(template.subject);
            const compiledBody = handlebars_1.default.compile(template.body);
            // Replace variables
            const subject = compiledSubject(emailData.variables);
            const htmlBody = compiledBody(emailData.variables);
            // Send email
            const mailOptions = {
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: emailData.to,
                subject,
                html: htmlBody
            };
            const result = await this.transporter.sendMail(mailOptions);
            // Log email
            await prisma.emailLog.create({
                data: {
                    to: emailData.to,
                    subject,
                    body: htmlBody,
                    status: 'sent'
                }
            });
            console.log(`Email sent successfully to ${emailData.to}`);
            return true;
        }
        catch (error) {
            console.error('Error sending email:', error);
            // Log failed email
            await prisma.emailLog.create({
                data: {
                    to: emailData.to,
                    subject: emailData.subject,
                    body: '',
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            });
            return false;
        }
    }
    async sendPayrollNotification(employeeId, payrollData) {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId }
        });
        if (!employee)
            return false;
        // Safely extract payroll fields, defaulting to 0 if missing
        const baseSalary = payrollData?.baseSalary ?? 0;
        const overtime = payrollData?.overtime ?? 0;
        const bonuses = payrollData?.bonuses ?? 0;
        const deductions = payrollData?.deductions ?? 0;
        const amount = payrollData?.amount ?? 0;
        const variables = {
            employeeName: `${employee.firstName} ${employee.lastName}`,
            month: new Date().toLocaleString('en-US', { month: 'long' }),
            year: new Date().getFullYear(),
            baseSalary: baseSalary.toFixed(2),
            overtime: overtime.toFixed(2),
            bonuses: bonuses.toFixed(2),
            deductions: deductions.toFixed(2),
            netPay: amount.toFixed(2)
        };
        return this.sendEmail({
            to: employee.email,
            subject: '',
            template: 'payroll_notification',
            variables
        });
    }
    async sendInvoiceReminder(invoiceId) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { customer: true }
        });
        if (!invoice || !invoice.customer)
            return false;
        const dueDate = invoice.dueDate || new Date();
        const daysOverdue = Math.max(0, Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        const variables = {
            customerName: invoice.customer.name,
            invoiceNumber: invoice.id.toString(),
            amount: invoice.amount.toFixed(2),
            dueDate: dueDate.toLocaleDateString(),
            daysOverdue: daysOverdue.toString()
        };
        return this.sendEmail({
            to: invoice.customer.email,
            subject: '',
            template: 'invoice_reminder',
            variables
        });
    }
    async sendLowStockAlert(productId) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { stock: true }
        });
        if (!product)
            return false;
        const totalStock = product.stock.reduce((sum, stock) => sum + stock.quantity, 0);
        const variables = {
            productName: product.name,
            currentStock: totalStock.toString(),
            minThreshold: product.lowStockThreshold.toString(),
            sku: product.sku
        };
        // Send to all admin users
        const adminUsers = await prisma.user.findMany({
            where: { role: { name: 'admin' } },
            include: { employee: true }
        });
        let success = true;
        for (const user of adminUsers) {
            if (user.employee?.email) {
                const result = await this.sendEmail({
                    to: user.employee.email,
                    subject: '',
                    template: 'low_stock_alert',
                    variables
                });
                if (!result)
                    success = false;
            }
        }
        return success;
    }
    async sendTaskReminder(taskId) {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                assignedTo: true,
                project: true
            }
        });
        if (!task || !task.assignedTo)
            return false;
        const variables = {
            employeeName: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
            taskName: task.name,
            projectName: task.project.name,
            dueDate: task.dueDate?.toLocaleDateString() || 'No due date',
            priority: task.priority,
            description: task.description || 'No description'
        };
        return this.sendEmail({
            to: task.assignedTo.email,
            subject: '',
            template: 'task_reminder',
            variables
        });
    }
    async sendAttendanceReminder(employeeId) {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId }
        });
        if (!employee)
            return false;
        const variables = {
            employeeName: `${employee.firstName} ${employee.lastName}`
        };
        return this.sendEmail({
            to: employee.email,
            subject: '',
            template: 'attendance_reminder',
            variables
        });
    }
}
exports.default = new EmailService();
