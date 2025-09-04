const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const patientRoutes = require('./patients');
const logRoutes = require('./logs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/logs', logRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Medical API is running on Vercel' });
});

// Rota padrão
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à Medical API', status: 'Online' });
});

module.exports = app;