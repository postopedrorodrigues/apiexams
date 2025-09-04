const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/patients - Listar todos os pacientes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/patients/:cpf - Buscar paciente por CPF
router.get('/:cpf', authenticateToken, async (req, res) => {
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

// POST /api/patients - Adicionar novo paciente
router.post('/', authenticateToken, async (req, res) => {
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

// PUT /api/patients/:cpf - Atualizar paciente
router.put('/:cpf', authenticateToken, async (req, res) => {
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

module.exports = router;