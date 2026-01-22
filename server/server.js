import express from 'express';
import cors from 'cors';
import { dbOperations } from './database.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Get all requests
app.get('/api/requests', async (req, res) => {
    try {
        const requests = await dbOperations.getAllRequests();
        res.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Get single request by ID
app.get('/api/requests/:id', async (req, res) => {
    try {
        const request = await dbOperations.getRequestById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(request);
    } catch (error) {
        console.error('Error fetching request:', error);
        res.status(500).json({ error: 'Failed to fetch request' });
    }
});

// Create new request
app.post('/api/requests', async (req, res) => {
    try {
        const newRequest = await dbOperations.createRequest(req.body);
        res.status(201).json(newRequest);
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ error: 'Failed to create request' });
    }
});

// Add submission to a request
app.post('/api/requests/:id/submissions', async (req, res) => {
    try {
        const updatedRequest = await dbOperations.addSubmission(req.params.id, req.body);
        if (!updatedRequest) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(updatedRequest);
    } catch (error) {
        console.error('Error adding submission:', error);
        res.status(500).json({ error: 'Failed to add submission' });
    }
});

// Update request status
app.put('/api/requests/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedRequest = await dbOperations.updateRequestStatus(req.params.id, status);
        if (!updatedRequest) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(updatedRequest);
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Update full request (columns, etc)
app.put('/api/requests/:id', async (req, res) => {
    try {
        const updatedRequest = await dbOperations.updateRequest(req.params.id, req.body);
        if (!updatedRequest) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(updatedRequest);
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ error: 'Failed to update request' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
async function startServer() {
    try {
        app.listen(PORT, () => {
            console.log(`🚀 Backend server running on http://localhost:${PORT}`);
            console.log(`📊 Database initialized successfully`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

