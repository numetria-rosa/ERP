"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const router = (0, express_1.Router)();
// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await prisma_1.default.project.findMany({
            include: {
                customer: true,
                tasks: {
                    include: {
                        assignedTo: true
                    }
                }
            }
        });
        // Transform to match frontend interface
        const transformedProjects = projects.map(project => {
            const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
            const totalTasks = project.tasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            return {
                id: project.id,
                name: project.name,
                customer: project.customer.name,
                status: totalTasks === 0 ? 'planning' :
                    progress === 100 ? 'completed' :
                        progress > 50 ? 'in-progress' : 'active',
                progress,
                startDate: new Date().toISOString().split('T')[0], // Add startDate field to schema if needed
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Add endDate field to schema if needed
                budget: 0, // Add budget field to schema if needed
                spent: 0, // Add spent field to schema if needed
                team: project.tasks
                    .map(task => task.assignedTo?.firstName + ' ' + task.assignedTo?.lastName)
                    .filter(Boolean)
                    .slice(0, 3), // Show first 3 team members
                priority: 'medium', // Add priority field to schema if needed
                description: '' // Add description field to schema if needed
            };
        });
        res.json(transformedProjects);
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
// Get single project
router.get('/:id', async (req, res) => {
    try {
        const project = await prisma_1.default.project.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                customer: true,
                tasks: {
                    include: {
                        assignedTo: true
                    }
                }
            }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    }
    catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});
// Create new project
router.post('/', async (req, res) => {
    try {
        const { name, customerId, description, startDate, endDate, budget, priority } = req.body;
        const project = await prisma_1.default.project.create({
            data: {
                name,
                customerId: parseInt(customerId)
            },
            include: {
                customer: true
            }
        });
        // Transform to match frontend interface
        const transformedProject = {
            id: project.id,
            name: project.name,
            customer: project.customer.name,
            status: 'planning',
            progress: 0,
            startDate: startDate || new Date().toISOString().split('T')[0],
            endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            budget: budget || 0,
            spent: 0,
            team: [],
            priority: priority || 'medium',
            description: description || ''
        };
        res.status(201).json(transformedProject);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});
// Update project
router.put('/:id', async (req, res) => {
    try {
        const { name, customerId, description, startDate, endDate, budget, priority } = req.body;
        const project = await prisma_1.default.project.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name,
                customerId: parseInt(customerId)
            },
            include: {
                customer: true,
                tasks: {
                    include: {
                        assignedTo: true
                    }
                }
            }
        });
        const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
        const totalTasks = project.tasks.length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        // Transform to match frontend interface
        const transformedProject = {
            id: project.id,
            name: project.name,
            customer: project.customer.name,
            status: totalTasks === 0 ? 'planning' :
                progress === 100 ? 'completed' :
                    progress > 50 ? 'in-progress' : 'active',
            progress,
            startDate: startDate || new Date().toISOString().split('T')[0],
            endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            budget: budget || 0,
            spent: 0,
            team: project.tasks
                .map(task => task.assignedTo?.firstName + ' ' + task.assignedTo?.lastName)
                .filter(Boolean)
                .slice(0, 3),
            priority: priority || 'medium',
            description: description || ''
        };
        res.json(transformedProject);
    }
    catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});
// Delete project
router.delete('/:id', async (req, res) => {
    try {
        await prisma_1.default.project.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});
// Get project tasks
router.get('/:id/tasks', async (req, res) => {
    try {
        const tasks = await prisma_1.default.task.findMany({
            where: { projectId: parseInt(req.params.id) },
            include: {
                assignedTo: true
            }
        });
        // Transform to match frontend interface
        const transformedTasks = tasks.map(task => ({
            id: task.id,
            name: task.name,
            status: task.status,
            assignedTo: task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned',
            dueDate: new Date().toISOString().split('T')[0], // Add dueDate field to schema if needed
            priority: 'medium', // Add priority field to schema if needed
            description: '' // Add description field to schema if needed
        }));
        res.json(transformedTasks);
    }
    catch (error) {
        console.error('Error fetching project tasks:', error);
        res.status(500).json({ error: 'Failed to fetch project tasks' });
    }
});
// Create project task
router.post('/:id/tasks', async (req, res) => {
    try {
        const { name, assignedToId, status, description, dueDate, priority } = req.body;
        const task = await prisma_1.default.task.create({
            data: {
                name,
                projectId: parseInt(req.params.id),
                assignedToId: assignedToId ? parseInt(assignedToId) : null,
                status: status || 'pending'
            },
            include: {
                assignedTo: true
            }
        });
        // Transform to match frontend interface
        const transformedTask = {
            id: task.id,
            name: task.name,
            status: task.status,
            assignedTo: task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned',
            dueDate: dueDate || new Date().toISOString().split('T')[0],
            priority: priority || 'medium',
            description: description || ''
        };
        res.status(201).json(transformedTask);
    }
    catch (error) {
        console.error('Error creating project task:', error);
        res.status(500).json({ error: 'Failed to create project task' });
    }
});
exports.default = router;
