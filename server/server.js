import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbOperations, initDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'tatapower_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middlewares
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Authentication required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
        }
        next();
    };
};

// --- AUTH ROUTES ---

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await dbOperations.getUserByUsername(username);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, username: user.username, role: user.role, name: user.name }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get all users (Admin only)
app.get('/api/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await dbOperations.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user role (Admin only)
app.put('/api/users/:id/role', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { role } = req.body;
        const updatedUser = await dbOperations.updateUserRole(req.params.id, role);
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// Create new user (Admin only)
app.post('/api/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const newUser = await dbOperations.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        if (error.code === '23505') { // Postgres Unique Violation
            return res.status(400).json({ error: 'Username already exists' });
        }
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Delete user (Admin only)
app.delete('/api/users/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({ error: 'You cannot delete your own account' });
        }

        await dbOperations.deleteUser(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// --- REQUEST ROUTES ---

// Get all requests (Public/Viewer)
app.get('/api/requests', async (req, res) => {
    try {
        const requests = await dbOperations.getAllRequests();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Get single request (Public/Viewer)
app.get('/api/requests/:id', async (req, res) => {
    try {
        const request = await dbOperations.getRequestById(req.params.id);
        if (!request) return res.status(404).json({ error: 'Request not found' });
        res.json(request);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch request' });
    }
});

// Create new request (Editor/Admin)
app.post('/api/requests', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
    try {
        const newRequest = await dbOperations.createRequest(req.body, req.user.id);
        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create request' });
    }
});

// Add submission (Public/Viewer - anyone can submit data)
app.post('/api/requests/:id/submissions', async (req, res) => {
    try {
        const updatedRequest = await dbOperations.addSubmission(req.params.id, req.body);
        if (!updatedRequest) return res.status(404).json({ error: 'Request not found' });
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add submission' });
    }
});

// Update request status (Editor/Admin)
app.put('/api/requests/:id/status', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
    try {
        const { status } = req.body;
        const updatedRequest = await dbOperations.updateRequestStatus(req.params.id, status);
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Update full request (Editor/Admin)
app.put('/api/requests/:id', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
    try {
        const request = await dbOperations.getRequestById(req.params.id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        // Authorization check for editors: can only edit own requests (optional, but good for "cannot delete anyone else's" vibe)
        // User didn't explicitly say editors can't edit others, but said they "cannot delete someone else's request"

        const updatedRequest = await dbOperations.updateRequest(req.params.id, req.body);
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update request' });
    }
});

// Delete request (Admin or Editor if owner)
app.delete('/api/requests/:id', authenticateToken, authorizeRoles('editor', 'admin'), async (req, res) => {
    try {
        const request = await dbOperations.getRequestById(req.params.id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        // Rule: Editors cannot delete anyone else's request
        if (req.user.role === 'editor' && request.createdBy !== req.user.id) {
            return res.status(403).json({ error: 'Editors can only delete their own requests' });
        }

        await dbOperations.deleteRequest(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete request' });
    }
});

// Custom 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start server
async function startServer() {
    try {
        await initDatabase();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Backend server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

