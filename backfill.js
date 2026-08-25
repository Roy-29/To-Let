const { Pool } = require('@neondatabase/serverless');

async function main() {
  const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_ay0PKplmw6qL@ep-patient-cake-axzwphhh-pooler.c-4.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require" });
  try {
    // Add unique constraint manually
    await pool.query('ALTER TABLE "User" ADD CONSTRAINT "User_uniqueCode_key" UNIQUE ("uniqueCode")');
    console.log("Added UNIQUE constraint to uniqueCode successfully.");
    
    // Alter column to be NOT NULL
    await pool.query('ALTER TABLE "User" ALTER COLUMN "uniqueCode" SET NOT NULL');
    console.log("Added NOT NULL constraint to uniqueCode successfully.");
  } catch (err) {
    console.error("Error modifying table:", err);
  } finally {
    await pool.end();
  }
}
main().catch(console.error);
