const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    }
  });

  // Criar alguns pacientes de exemplo
  await prisma.patient.createMany({
    data: [
      {
        name: 'Maria Oliveira',
        cpf: '12345678900',
        birthDate: new Date('1985-03-15'),
        motherName: 'Ana Oliveira',
        phone: '(11) 99999-9999',
        examType: 'Ressonância Magnética',
        status: 'Agendado',
        examDate: new Date('2023-07-10'),
        protocol: 'PROT123'
      },
      {
        name: 'Carlos Silva',
        cpf: '98765432100',
        birthDate: new Date('1978-07-22'),
        motherName: 'Beatriz Silva',
        phone: '(11) 98888-8888',
        examType: 'Tomografia Computadorizada',
        status: 'Realizado',
        examDate: new Date('2023-06-20'),
        protocol: 'PROT456'
      }
    ],
    skipDuplicates: true
  });

  console.log('Dados iniciais criados com sucesso');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });