import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';

const router = Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        employee: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role.name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user info (without password)
    const userInfo = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      name: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email
    };

    res.json({
      token,
      user: userInfo
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get default role (assuming 'user' role exists)
    const defaultRole = await prisma.role.findFirst({
      where: { name: 'user' }
    });

    if (!defaultRole) {
      return res.status(500).json({ error: 'Default role not found' });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId: defaultRole.id
      },
      include: {
        role: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role.name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user info (without password)
    const userInfo = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      name: name || user.email
    };

    res.status(201).json({
      token,
      user: userInfo
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    // Get user from JWT token (you'll need to implement middleware for this)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
        employee: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user info (without password)
    const userInfo = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      name: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email
    };

    res.json(userInfo);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router; 