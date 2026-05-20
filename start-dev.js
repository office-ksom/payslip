const { spawn } = require('child_process');
const path = require('path');

console.log('Starting development environment...');

// 1. Start the log helper server
const logServer = spawn('node', ['log-server.js'], {
  stdio: 'inherit',
  shell: true
});

// 2. Start Wrangler Dev server
const wrangler = spawn('npm', ['run', 'dev:wrangler', '--prefix', 'payslip-ui'], {
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\nStopping development servers...');
  logServer.kill();
  wrangler.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
