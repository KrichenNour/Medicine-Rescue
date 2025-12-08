#!/usr/bin/env node

/**
 * Setup Script for ArcGIS Maps Integration
 * Run this after getting your ArcGIS API key
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('\n🗺️  Medicine Rescue - ArcGIS Maps Setup\n');
  console.log('═══════════════════════════════════════════════════\n');

  // Check if .env.local already exists
  const envPath = path.join(__dirname, '../.env.local');
  let apiKey = '';

  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists\n');
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/NEXT_PUBLIC_ARCGIS_API_KEY=(.+)/);
    
    if (match && match[1] && match[1] !== 'your_arcgis_api_key_here') {
      console.log('✅ ArcGIS API key already configured!\n');
      apiKey = match[1];
    }
  }

  if (!apiKey) {
    console.log('📋 Step 1: Get your FREE ArcGIS API key');
    console.log('   → Visit: https://developers.arcgis.com/sign-up/');
    console.log('   → Sign up and go to Dashboard');
    console.log('   → Create an API Key\n');

    apiKey = await question('Enter your ArcGIS API key: ');

    if (!apiKey || apiKey.trim() === '') {
      console.log('\n❌ API key is required. Please run this script again.\n');
      rl.close();
      return;
    }

    // Write to .env.local
    const envContent = `# ArcGIS API Key\nNEXT_PUBLIC_ARCGIS_API_KEY=${apiKey.trim()}\n`;
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ API key saved to .env.local\n');
  }

  console.log('═══════════════════════════════════════════════════\n');
  console.log('📋 Step 2: Database Migration\n');
  console.log('You need to run the database migration to add location fields.');
  console.log('Run ONE of these commands:\n');
  console.log('Option A - Using psql command:');
  console.log('  cd backend');
  console.log('  psql -U postgres -d your_database_name -f migrations/add_location_to_medicine.sql\n');
  console.log('Option B - Inside PostgreSQL:');
  console.log('  \\i backend/migrations/add_location_to_medicine.sql\n');
  
  const runMigration = await question('Have you run the database migration? (y/n): ');

  if (runMigration.toLowerCase() !== 'y') {
    console.log('\n⚠️  Please run the migration first, then restart this setup.\n');
    rl.close();
    return;
  }

  console.log('\n═══════════════════════════════════════════════════\n');
  console.log('📋 Step 3: Import Sample Data (Optional)\n');
  console.log('This will import donors and supplies from your CSV files.\n');

  const importData = await question('Would you like to import CSV data now? (y/n): ');

  if (importData.toLowerCase() === 'y') {
    console.log('\n⏳ Importing data...\n');
    
    try {
      const { execSync } = require('child_process');
      execSync('node importCSVData.js', { 
        cwd: path.join(__dirname),
        stdio: 'inherit' 
      });
    } catch (error) {
      console.log('\n⚠️  Import failed. You can run it manually later:');
      console.log('   cd backend && node importCSVData.js\n');
    }
  } else {
    console.log('\nℹ️  You can import data later by running:');
    console.log('   cd backend && node importCSVData.js\n');
  }

  console.log('\n═══════════════════════════════════════════════════\n');
  console.log('🎉 Setup Complete!\n');
  console.log('Next steps:\n');
  console.log('1. Start your backend:');
  console.log('   cd backend && npm run dev\n');
  console.log('2. Start your frontend (in another terminal):');
  console.log('   npm run dev\n');
  console.log('3. Navigate to the map page in your app\n');
  console.log('📖 For more info, see: QUICK_START_MAPS.md\n');

  rl.close();
}

setup().catch(error => {
  console.error('Error during setup:', error);
  rl.close();
  process.exit(1);
});
