// View Database Schema
const pool = require('./db');

async function viewSchema() {
  try {
    console.log('\n📊 DATABASE SCHEMA VISUALIZATION\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const { rows: tables } = await pool.query(tablesQuery);
    
    console.log(`Found ${tables.length} tables:\n`);

    // For each table, get columns
    for (const table of tables) {
      const tableName = table.table_name;
      
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `;
      
      const { rows: columns } = await pool.query(columnsQuery, [tableName]);
      
      console.log(`\n┌─────────────────────────────────────────────────────────┐`);
      console.log(`│ TABLE: ${tableName.toUpperCase().padEnd(47)} │`);
      console.log(`└─────────────────────────────────────────────────────────┘`);
      console.log(`\n  Column Name              Type                 Nullable   Default`);
      console.log(`  ──────────────────────── ──────────────────── ────────── ─────────`);
      
      columns.forEach(col => {
        const colName = col.column_name.padEnd(24);
        let dataType = col.data_type;
        if (col.character_maximum_length) {
          dataType += `(${col.character_maximum_length})`;
        }
        dataType = dataType.padEnd(20);
        const nullable = col.is_nullable.padEnd(10);
        const defaultVal = (col.column_default || '').substring(0, 30);
        
        console.log(`  ${colName} ${dataType} ${nullable} ${defaultVal}`);
      });
      
      // Get row count
      const countQuery = `SELECT COUNT(*) FROM ${tableName}`;
      const { rows: countRows } = await pool.query(countQuery);
      console.log(`\n  📦 Total rows: ${countRows[0].count}\n`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error viewing schema:', error.message);
    process.exit(1);
  }
}

viewSchema();
