// List all databases and then show schema
const { Client } = require('pg');

async function listDatabases() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    port: 5432,
    database: 'postgres' // Connect to default postgres database first
  });

  try {
    await client.connect();
    console.log('\n🗄️  AVAILABLE DATABASES\n');
    console.log('═══════════════════════════════════════════════\n');

    const result = await client.query(`
      SELECT datname 
      FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY datname;
    `);

    result.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.datname}`);
    });

    console.log('\n═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure PostgreSQL is running on localhost:5432');
  } finally {
    await client.end();
  }
}

listDatabases();
