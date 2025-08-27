"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Global search across all entities
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string' || q.length < 2) {
            return res.json([]);
        }
        const searchTerm = q.toLowerCase();
        const results = [];
        // Employee search
        const employees = await prisma.employee.findMany({
            where: {
                OR: [
                    { firstName: { contains: searchTerm, mode: 'insensitive' } },
                    { lastName: { contains: searchTerm, mode: 'insensitive' } },
                    { email: { contains: searchTerm, mode: 'insensitive' } }
                ]
            }
        });
        for (const emp of employees) {
            results.push({
                type: 'Employee',
                id: emp.id,
                title: emp.firstName + ' ' + emp.lastName,
                subtitle: emp.email
            });
        }
        // Customer search
        const customers = await prisma.customer.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { email: { contains: searchTerm, mode: 'insensitive' } }
                ]
            }
        });
        for (const cust of customers) {
            results.push({
                type: 'Customer',
                id: cust.id,
                title: cust.name,
                subtitle: cust.name || 'Individual',
                email: cust.email
            });
        }
        // Task search
        const tasks = await prisma.task.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } }
                ]
            },
            include: { project: true }
        });
        for (const task of tasks) {
            results.push({
                type: 'Task',
                id: task.id,
                title: task.name,
                subtitle: task.project?.name || 'No Project',
                description: task.description
            });
        }
        // Product search
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { sku: { contains: searchTerm, mode: 'insensitive' } }
                ]
            },
            include: { stock: true }
        });
        for (const prod of products) {
            const stockQuantity = prod.stock?.reduce((sum, s) => sum + s.quantity, 0) || 0;
            results.push({
                type: 'Product',
                id: prod.id,
                title: prod.name,
                subtitle: prod.sku,
                status: stockQuantity > 0 ? 'In Stock' : 'Out of Stock',
                stockQuantity
            });
        }
        // Project search
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } }
                ]
            },
            include: { customer: true }
        });
        for (const proj of projects) {
            results.push({
                type: 'Project',
                id: proj.id,
                title: proj.name,
                subtitle: proj.customer?.name || 'Internal Project',
                // description: proj.description?.substring(0, 100), // Remove if not present
            });
        }
        // Sort results by relevance (exact matches first, then partial matches)
        results.sort((a, b) => {
            const aExact = a.title.toLowerCase().includes(searchTerm) ||
                a.subtitle.toLowerCase().includes(searchTerm);
            const bExact = b.title.toLowerCase().includes(searchTerm) ||
                b.subtitle.toLowerCase().includes(searchTerm);
            if (aExact && !bExact)
                return -1;
            if (!aExact && bExact)
                return 1;
            return 0;
        });
        res.json(results.slice(0, 20)); // Limit to 20 results total
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Search failed' });
    }
});
exports.default = router;
