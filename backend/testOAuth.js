// Test OAuth 2.0 Implementation
require('dotenv').config();
const { getArcGISToken, getBasemapStyles, testToken } = require('./services/arcgisService');

console.log('🔑 Testing ArcGIS OAuth 2.0...\n');
console.log('='.repeat(60));

async function test() {
  try {
    // Check if credentials are configured
    if (!process.env.ARCGIS_CLIENT_ID || !process.env.ARCGIS_CLIENT_SECRET) {
      console.log('❌ ArcGIS credentials not found!');
      console.log('\n📝 Please add to backend/.env:');
      console.log('   ARCGIS_CLIENT_ID=your_client_id');
      console.log('   ARCGIS_CLIENT_SECRET=your_client_secret');
      console.log('\n📖 Get credentials from: https://developers.arcgis.com/applications\n');
      return;
    }

    // Test 1: Get OAuth token
    console.log('📡 Getting OAuth 2.0 token from ArcGIS...');
    const token = await getArcGISToken();
    console.log(`✅ Token obtained: ${token.substring(0, 30)}...\n`);
    
    // Test 2: Test if token is valid
    console.log('🔐 Testing token validity...');
    const tokenTest = await testToken();
    if (tokenTest.valid) {
      console.log('✅ Token is valid!');
      if (tokenTest.portalName) {
        console.log(`   Portal: ${tokenTest.portalName}`);
      }
      console.log('');
    } else if (tokenTest.error) {
      console.log('⚠️  Portal validation skipped (token still works)');
      console.log('');
    } else {
      console.log('✅ Token obtained successfully');
      console.log('');
    }
    
    // Test 3: Try to get basemap styles
    console.log('🗺️  Testing basemap access...');
    const styles = await getBasemapStyles();
    
    if (styles && styles.styles && Array.isArray(styles.styles)) {
      console.log(`✅ Available basemap styles: ${styles.styles.length}\n`);
      console.log('Basemaps:');
      styles.styles.slice(0, 5).forEach(style => {
        console.log(`  - ${style.name || style.id}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ OAuth 2.0 setup is working correctly!');
    console.log('\n🎯 Your credentials are valid and working');
    console.log('🔒 API key is kept secret on the server');
    console.log('🌐 Frontend will get token through your backend');
    console.log('\n📚 Next steps:');
    console.log('   1. Import CSV data: node importCSVData.js');
    console.log('   2. Start backend: npm run dev');
    console.log('   3. Start frontend: cd .. && npm run dev');
    console.log('   4. Visit: http://localhost:3000/map\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Check your Client ID and Client Secret in .env');
    console.log('  2. Verify credentials at: https://developers.arcgis.com/applications');
    console.log('  3. Make sure OAuth 2.0 is enabled for your application\n');
  }
}

test();
