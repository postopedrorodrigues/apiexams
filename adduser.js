// adduser.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const prisma = new PrismaClient();

async function main() {
  console.log('🐢  Sistema de Gestão Médica - Criador de Usuários');
  console.log('==================================================\n');

  // Solicitar dados do usuário
  readline.question('📝  Digite o nome de usuário: ', async (username) => {
    readline.question('🔒  Digite a senha: ', async (password) => {
      readline.question('👤  Digite o cargo (user/admin): ', async (role) => {
        
        // Validar role
        if (role !== 'user' && role !== 'admin') {
          console.log('❌  Cargo inválido. Usando "user" como padrão.');
          role = 'user';
        }

        try {
          // Criptografar a senha
          const hashedPassword = await bcrypt.hash(password, 10);
          
          // Criar usuário no banco de dados
          const user = await prisma.user.create({
            data: {
              username,
              password: hashedPassword,
              role
            }
          });

          console.log('\n✅  USUÁRIO CRIADO COM SUCESSO!');
          console.log('================================');
          console.log(`👤  ID: ${user.id}`);
          console.log(`📛  Usuário: ${user.username}`);
          console.log(`👑  Cargo: ${user.role}`);
          console.log('================================\n');
          
        } catch (error) {
          if (error.code === 'P2002') {
            console.log('❌  ERRO: Este nome de usuário já existe!');
          } else {
            console.log('❌  ERRO:', error.message);
          }
        } finally {
          await prisma.$disconnect();
          readline.close();
        }
      });
    });
  });
}

// Executar o script
main().catch(async (e) => {
  console.error('❌  Erro inesperado:', e);
  await prisma.$disconnect();
  process.exit(1);
});