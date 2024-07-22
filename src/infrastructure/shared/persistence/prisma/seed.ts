/* spell-checker: disable */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//const CURRENT_DATE = DateTime.utc().toJSDate();

const main = async (): Promise<void> => {
  try {
    // write your seed creations here
  } catch {
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

main();
