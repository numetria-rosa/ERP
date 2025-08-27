"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const hr_1 = __importDefault(require("./modules/hr"));
const accounting_1 = __importDefault(require("./modules/accounting"));
const inventory_1 = __importDefault(require("./modules/inventory"));
const crm_1 = __importDefault(require("./modules/crm"));
const projects_1 = __importDefault(require("./modules/projects"));
const reports_1 = __importDefault(require("./modules/reports"));
const auth_1 = __importDefault(require("./modules/auth"));
const automation_1 = __importDefault(require("./modules/automation"));
const insights_1 = __importDefault(require("./modules/insights"));
const search_1 = __importDefault(require("./modules/search"));
// Initialize automation service
require("./services/automationService");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', 1); // or true, or the number of proxies in front of you
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express_1.default.json());
app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 }));
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/hr', hr_1.default);
app.use('/api/accounting', accounting_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/crm', crm_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/automation', automation_1.default);
app.use('/api/insights', insights_1.default);
app.use('/api/search', search_1.default);
// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});
exports.default = app;
