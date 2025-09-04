const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Funções JWT
function createJWT(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function verifyJWT(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }

  req.user = decoded;
  next();
}

// Rotas de Autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = createJWT({ 
      userId: user.id, 
      username: user.username, 
      role: user.role 
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas de Pacientes
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/patients/:cpf', authenticateToken, async (req, res) => {
  try {
    const { cpf } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { cpf }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients', authenticateToken, async (req, res) => {
  try {
    const patientData = req.body;
    const user = req.user;

    const newPatient = await prisma.patient.create({
      data: patientData
    });

    // Registrar no log
    await prisma.log.create({
      data: {
        cpf: patientData.cpf,
        action: 'INSERT',
        detail: `Paciente adicionado: ${patientData.name}`,
        user: user.username
      }
    });

    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/patients/:cpf', authenticateToken, async (req, res) => {
  try {
    const { cpf } = req.params;
    const updates = req.body;
    const user = req.user;

    const updatedPatient = await prisma.patient.update({
      where: { cpf },
      data: updates
    });

    // Registrar no log
    await prisma.log.create({
      data: {
        cpf,
        action: 'UPDATE',
        detail: `Paciente atualizado: ${JSON.stringify(updates)}`,
        user: user.username
      }
    });

    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas de Logs
app.get('/api/logs', authenticateToken, async (req, res) => {
  try {
    const logs = await prisma.log.findMany({
      orderBy: { timestamp: 'desc' }
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Medical API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});