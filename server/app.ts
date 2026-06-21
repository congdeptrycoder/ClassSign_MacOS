import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import authRoutes from './auth/auth.routes';
import semesterRoutes from './semester/semester.routes';
import academicPeriodRoutes from './academic-period/academic-period.routes';
import studentRegistrationRoutes from './student-registration/student-registration.routes';
import adminRoutes from './admin/admin.routes';
import { registerAuditLogSubscriber } from './subscribers/RegistrationAuditLogSubscriber';
import { registerClassCapacityWarningSubscriber } from './subscribers/ClassCapacityWarningSubscriber';
import { sendSuccess, sendError } from './httpResponse';

export const app = express();

// Register Event Subscribers
registerAuditLogSubscriber();
registerClassCapacityWarningSubscriber();

// Configure middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/academic-periods', academicPeriodRoutes);
app.use('/api/students', studentRegistrationRoutes);
app.use('/api/admin', adminRoutes);

let LOG_DIR = path.join(__dirname, '../logs');

if (process.versions && process.versions.electron) {
    const { app: electronApp } = require('electron');
    LOG_DIR = path.join(electronApp.getPath('userData'), 'logs');
}

const CLIENT_LOG_FILE = path.join(LOG_DIR, 'client.log');

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

app.post('/api/logs', (req: express.Request, res: express.Response) => {
    const { level, message, timestamp } = req.body;
    const logTime = timestamp || new Date().toISOString();
    const logMessage = `[${logTime}] [${level || 'INFO'}] ${message}\n`;
    
    fs.appendFile(CLIENT_LOG_FILE, logMessage, (err) => {
        if (err) {
            console.error('Failed to write client log:', err);
            return sendError(res, 500, 'Không thể ghi log.');
        }
        return sendSuccess(res, {});
    });
});

