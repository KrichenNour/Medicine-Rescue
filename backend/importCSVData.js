// CSV Import Utility for Medicine Rescue
// Run this script to import donor and supply data from CSV files into the database
// Usage: node importCSVData.js

const fs = require('fs');
const path = require('path');
const pool = require('./db');

// Simple CSV parser
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }
  
  return data;
}

async function importData() {
  try {
    console.log('🚀 Starting CSV import...\n');

    // Parse CSV files
    const donorsPath = path.join(__dirname, '../ArcGIS/donors.csv');
    const suppliesPath = path.join(__dirname, '../ArcGIS/supplies.csv');

    console.log('📖 Reading CSV files...');
    const donors = parseCSV(donorsPath);
    const supplies = parseCSV(suppliesPath);

    console.log(`✓ Found ${donors.length} donors`);
    console.log(`✓ Found ${supplies.length} supplies\n`);

    // Create a map of donors by ID
    const donorMap = {};
    donors.forEach(donor => {
      donorMap[donor.donor_id] = donor;
    });

    // Import each supply with its donor information
    console.log('💾 Importing data into database...\n');
    
    for (const supply of supplies) {
      const donor = donorMap[supply.donor_id];
      
      if (!donor) {
        console.log(`⚠️  Warning: Donor ${supply.donor_id} not found for supply ${supply.name}`);
        continue;
      }

      try {
        const result = await pool.query(
          `INSERT INTO medicine 
           (name, description, quantity, quantity_unit, expiry_date, category,
            latitude, longitude, donor_name, donor_address, donor_type, working_hours)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING id, name`,
          [
            supply.name,
            `${supply.category} from ${donor.name}`,
            parseInt(supply.quantity) || 0,
            'units',
            supply.expiration_date || null,
            supply.category || 'Supplies',
            parseFloat(donor.latitude) || null,
            parseFloat(donor.longitude) || null,
            donor.name,
            donor.address,
            donor.type,
            donor.working_hours || 'Not specified'
          ]
        );

        console.log(`✓ Imported: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
      } catch (err) {
        console.error(`✗ Error importing ${supply.name}:`, err.message);
      }
    }

    console.log('\n✅ Import completed successfully!');
    console.log('\n📊 Summary:');
    
    const countResult = await pool.query('SELECT COUNT(*) FROM medicine WHERE latitude IS NOT NULL');
    console.log(`   Total medicines with locations: ${countResult.rows[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importData();
