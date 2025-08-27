"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const router = (0, express_1.Router)();
// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await prisma_1.default.product.findMany({
            include: {
                stock: {
                    include: {
                        warehouse: true
                    }
                }
            }
        });
        // Transform to match frontend interface
        const transformedProducts = products.map(product => {
            const totalStock = product.stock.reduce((sum, stock) => sum + stock.quantity, 0);
            return {
                id: product.id,
                name: product.name,
                sku: product.sku,
                price: product.price,
                stock: totalStock,
                category: 'General', // Add category field to schema if needed
                status: totalStock > 0 ? 'in-stock' : 'out-of-stock',
                description: '', // Add description field to schema if needed
                image: null
            };
        });
        res.json(transformedProducts);
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
// Get single product
router.get('/products/:id', async (req, res) => {
    try {
        const product = await prisma_1.default.product.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                stock: {
                    include: {
                        warehouse: true
                    }
                }
            }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});
// Create new product
router.post('/products', async (req, res) => {
    try {
        const { name, sku, price, stock, category } = req.body;
        const product = await prisma_1.default.product.create({
            data: {
                name,
                sku,
                price: parseFloat(price)
            }
        });
        // Create stock entry if stock quantity provided
        if (stock && stock > 0) {
            // Get or create default warehouse
            let warehouse = await prisma_1.default.warehouse.findFirst();
            if (!warehouse) {
                warehouse = await prisma_1.default.warehouse.create({
                    data: { name: 'Main Warehouse' }
                });
            }
            await prisma_1.default.stock.create({
                data: {
                    productId: product.id,
                    warehouseId: warehouse.id,
                    quantity: parseInt(stock)
                }
            });
        }
        // Transform to match frontend interface
        const transformedProduct = {
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            stock: stock || 0,
            category: category || 'General',
            status: (stock && stock > 0) ? 'in-stock' : 'out-of-stock',
            description: '',
            image: null
        };
        res.status(201).json(transformedProduct);
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});
// Update product
router.put('/products/:id', async (req, res) => {
    try {
        const { name, sku, price, stock } = req.body;
        const product = await prisma_1.default.product.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name,
                sku,
                price: parseFloat(price)
            }
        });
        // Update stock if provided
        if (stock !== undefined) {
            let warehouse = await prisma_1.default.warehouse.findFirst();
            if (!warehouse) {
                warehouse = await prisma_1.default.warehouse.create({
                    data: { name: 'Main Warehouse' }
                });
            }
            // Update existing stock or create new
            const existingStock = await prisma_1.default.stock.findFirst({
                where: { productId: product.id }
            });
            if (existingStock) {
                await prisma_1.default.stock.update({
                    where: { id: existingStock.id },
                    data: { quantity: parseInt(stock) }
                });
            }
            else {
                await prisma_1.default.stock.create({
                    data: {
                        productId: product.id,
                        warehouseId: warehouse.id,
                        quantity: parseInt(stock)
                    }
                });
            }
        }
        // Transform to match frontend interface
        const transformedProduct = {
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            stock: stock || 0,
            category: 'General',
            status: (stock && stock > 0) ? 'in-stock' : 'out-of-stock',
            description: '',
            image: null
        };
        res.json(transformedProduct);
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});
// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        await prisma_1.default.product.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
// Get categories
router.get('/categories', async (req, res) => {
    try {
        // For now, return static categories since we don't have a category model
        res.json(['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports']);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
// Get stock alerts
router.get('/stock-alerts', async (req, res) => {
    try {
        const products = await prisma_1.default.product.findMany({
            include: {
                stock: true
            }
        });
        const alerts = products
            .map(product => {
            const totalStock = product.stock.reduce((sum, stock) => sum + stock.quantity, 0);
            return {
                id: product.id,
                name: product.name,
                sku: product.sku,
                currentStock: totalStock,
                threshold: 10, // Default threshold
                status: totalStock <= 10 ? 'low' : 'normal'
            };
        })
            .filter(alert => alert.status === 'low');
        res.json(alerts);
    }
    catch (error) {
        console.error('Error fetching stock alerts:', error);
        res.status(500).json({ error: 'Failed to fetch stock alerts' });
    }
});
// Update stock
router.patch('/products/:id/stock', async (req, res) => {
    try {
        const { quantity } = req.body;
        let warehouse = await prisma_1.default.warehouse.findFirst();
        if (!warehouse) {
            warehouse = await prisma_1.default.warehouse.create({
                data: { name: 'Main Warehouse' }
            });
        }
        const existingStock = await prisma_1.default.stock.findFirst({
            where: { productId: parseInt(req.params.id) }
        });
        if (existingStock) {
            await prisma_1.default.stock.update({
                where: { id: existingStock.id },
                data: { quantity: parseInt(quantity) }
            });
        }
        else {
            await prisma_1.default.stock.create({
                data: {
                    productId: parseInt(req.params.id),
                    warehouseId: warehouse.id,
                    quantity: parseInt(quantity)
                }
            });
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ error: 'Failed to update stock' });
    }
});
exports.default = router;
