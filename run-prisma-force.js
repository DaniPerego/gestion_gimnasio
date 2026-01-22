require('dotenv').config({ path: '.env.local' });
const { spawn } = require('child_process');

const env = { ...process.env };
const proc = spawn('npx', ['prisma', 'db', 'push', '--accept-data-loss'], { env, stdio: 'inherit' });

proc.on('close', (code) => {
  process.exit(code);
});
