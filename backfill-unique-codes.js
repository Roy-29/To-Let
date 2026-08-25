const { PrismaClient } = require('./src/generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient();

function generateUniqueCode() {
  return "TK-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

async function main() {
  const users = await prisma.user.findMany({
    where: { uniqueCode: null },
  });

  console.log(`Found ${users.length} users missing unique codes.`);

  for (const user of users) {
    let code = generateUniqueCode();
    
    await prisma.user.update({
      where: { id: user.id },
      data: { uniqueCode: code },
    });
    console.log(`Updated user ${user.email} with code ${code}`);
  }

  console.log('Backfill complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
