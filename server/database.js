import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_FILE = join(__dirname, 'database.json');

// Initialize database file
async function initDatabase() {
  try {
    await fs.access(DB_FILE);
  } catch {
    // File doesn't exist, create with sample data
    const initialData = {
      requests: [
        {
          id: 'REQ-001',
          title: 'Meter inventory - South Zone',
          format: 'Excel',
          departments: ['Distribution', 'Maintenance'],
          emails: ['dist@tatapower.com', 'maint@tatapower.com'],
          deadline: '2025-01-15',
          emailSubject: 'Data request: Meter inventory - South Zone',
          emailBody: 'Hi team,\\n\\nPlease update the sheet for Meter inventory - South Zone.\\nDeadline: 2025-01-15\\nLink: {{link}}\\n\\nThanks,\\nData Office',
          reminders: { enabled: true, frequency: 'weekly' },
          instructions: 'Share all active meters with health status.',
          columns: ['Asset ID', 'Location', 'Status', 'Remarks'],
          submissions: [
            {
              department: 'Distribution',
              rows: [
                { 'Asset ID': 'MTR-001', Location: 'Mumbai', Status: 'Active', Remarks: '' },
                { 'Asset ID': 'MTR-002', Location: 'Pune', Status: 'Inactive', Remarks: 'Under repair' },
              ],
              completed: true,
            },
            {
              department: 'Maintenance',
              rows: [{ 'Asset ID': 'MTR-003', Location: 'Navi Mumbai', Status: 'Active', Remarks: '' }],
              completed: false,
            },
          ],
          status: 'In Progress',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log('✅ Database initialized with sample data');
  }
}

// Read database
async function readDB() {
  const data = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

// Write database
async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Database operations
export const dbOperations = {
  // Get all requests
  async getAllRequests() {
    const db = await readDB();
    return db.requests;
  },

  // Get single request by ID
  async getRequestById(id) {
    const db = await readDB();
    return db.requests.find(r => r.id === id) || null;
  },

  // Create new request
  async createRequest(request) {
    const db = await readDB();
    const newRequest = {
      ...request,
      submissions: request.submissions || [],
      status: request.status || 'In Progress',
      createdAt: new Date().toISOString(),
    };
    db.requests.push(newRequest);
    await writeDB(db);
    return newRequest;
  },

  // Add submission to a request
  async addSubmission(requestId, submission) {
    const db = await readDB();
    const request = db.requests.find(r => r.id === requestId);
    if (!request) return null;

    request.submissions.push({
      ...submission,
      createdAt: new Date().toISOString(),
    });
    await writeDB(db);
    return request;
  },

  // Update request status
  async updateRequestStatus(id, status) {
    const db = await readDB();
    const request = db.requests.find(r => r.id === id);
    if (!request) return null;

    request.status = status;
    await writeDB(db);
    return request;
  },

  // Update full request (e.g. columns)
  async updateRequest(id, updates) {
    const db = await readDB();
    const requestIndex = db.requests.findIndex(r => r.id === id);
    if (requestIndex === -1) return null;

    // updates could contain columns, etc.
    const updatedRequest = {
      ...db.requests[requestIndex],
      ...updates,
      id: id // ensure ID doesn't change
    };

    db.requests[requestIndex] = updatedRequest;
    await writeDB(db);
    return updatedRequest;
  },
};

// Initialize on module load (fire and forget)
initDatabase().catch(console.error);

