import express from 'express';
import cors from 'cors';
import authRoutes from './auth/auth.routes';

const app = express();
const PORT = process.env.PORT || 3002;

// Configure middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
