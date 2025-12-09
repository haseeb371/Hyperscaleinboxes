// Utility script to generate bcrypt password hash for .env file
// Run this with: node scripts/generate-password-hash.js

const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
  // Get password from command line argument
  const password = process.argv[2];

  if (!password) {
    console.error('Error: Please provide a password as argument');
    console.log('Usage: node scripts/generate-password-hash.js YOUR_PASSWORD');
    process.exit(1);
  }

  try {
    // Generate hash with 10 salt rounds
    const hash = await bcrypt.hash(password, 10);
    
    console.log('\n✅ Password hash generated successfully!\n');
    console.log('Add this to your .env file:\n');
    console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
    console.log('\nFull .env template:');
    console.log('---');
    console.log('ADMIN_EMAIL="your-admin@email.com"');
    console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
    console.log('JWT_SECRET="7kN9mP2xL5wQ8rT3vY6zB4nH1jM0sdfsd435f43sA2eW5uI8oK3pR6tY9bN4mL7xQ0"');
    console.log('---\n');
  } catch (error) {
    console.error('Error generating hash:', error);
    process.exit(1);
  }
}

generatePasswordHash();
