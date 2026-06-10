import express from 'express';
import cors from 'cors';
import authRoutes from './auth/auth.routes';
import semesterRoutes from './semester/semester.routes';
import academicPeriodRoutes from './academic-period/academic-period.routes';
import studentRegistrationRoutes from './student-registration/student-registration.routes';
import adminRoutes from './admin/admin.routes';
const app = express();
const PORT = process.env.PORT || 3002;

// Configure middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/academic-periods', academicPeriodRoutes);
app.use('/api/students', studentRegistrationRoutes);
app.use('/api/admin', adminRoutes);
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
