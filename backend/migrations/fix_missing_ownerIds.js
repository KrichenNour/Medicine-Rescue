/**
 * Migration Script: Fix Missing OwnerIds
 * 
 * This script updates existing medicines/supplies that are missing the ownerId field.
 * It will:
 * 1. Copy the 'donor' field to 'ownerId' if donor exists but ownerId is missing
 * 2. For supplies with neither, assign them to a default admin user (if provided)
 * 
 * Usage: node migrations/fix_missing_ownerIds.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db');

// Import Medicine model
const { Medicine } = require('../models/medicineModel');
const { User } = require('../models/userModel');

async function fixMissingOwnerIds() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Find all medicines without ownerId
    const medicinesWithoutOwnerId = await Medicine.find({
      $or: [
        { ownerId: { $exists: false } },
        { ownerId: null }
      ]
    });

    console.log(`\n📦 Found ${medicinesWithoutOwnerId.length} medicines without ownerId\n`);

    if (medicinesWithoutOwnerId.length === 0) {
      console.log('✅ All medicines already have ownerId. No migration needed.');
      process.exit(0);
    }

    let fixed = 0;
    let needsManualFix = 0;

    for (const medicine of medicinesWithoutOwnerId) {
      console.log(`Processing: ${medicine.name} (ID: ${medicine._id})`);

      if (medicine.donor) {
        // Copy donor to ownerId
        await Medicine.findByIdAndUpdate(medicine._id, {
          $set: { ownerId: medicine.donor }
        });
        console.log(`  ✅ Set ownerId from donor: ${medicine.donor}`);
        fixed++;
      } else {
        // No donor field either - need manual intervention
        console.log(`  ⚠️  No donor field found - requires manual assignment`);
        needsManualFix++;
      }
    }

    console.log('\n========== Migration Summary ==========');
    console.log(`Total processed: ${medicinesWithoutOwnerId.length}`);
    console.log(`Fixed automatically: ${fixed}`);
    console.log(`Needs manual fix: ${needsManualFix}`);

    if (needsManualFix > 0) {
      console.log('\n⚠️  Some medicines need manual ownerId assignment.');
      console.log('You can either:');
      console.log('  1. Delete these medicines and recreate them');
      console.log('  2. Assign them to a user manually in MongoDB');
      
      // List medicines that need manual fix
      const needsManual = await Medicine.find({
        $and: [
          { $or: [{ ownerId: { $exists: false } }, { ownerId: null }] },
          { $or: [{ donor: { $exists: false } }, { donor: null }] }
        ]
      });
      
      console.log('\nMedicines needing manual fix:');
      for (const med of needsManual) {
        console.log(`  - ${med.name} (ID: ${med._id})`);
      }
    }

    console.log('\n✅ Migration completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
fixMissingOwnerIds();
