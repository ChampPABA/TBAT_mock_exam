const { execSync } = require('child_process');
const path = require('path');

// Change to the apps/web directory
process.chdir(path.join(__dirname, 'apps', 'web'));

try {
  console.log('Generating Prisma client...');
  execSync('node ../../node_modules/.pnpm/prisma@6.15.0_typescript@5.9.2/node_modules/prisma/build/index.js generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully!');
} catch (error) {
  console.error('Failed to generate Prisma client:', error.message);
  process.exit(1);
}