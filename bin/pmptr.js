#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const electron = require('electron');

const appPath = path.join(__dirname, '..');
const child = spawn(electron, [appPath], { stdio: 'inherit' });

child.on('close', (code) => {
  process.exit(code ?? 0);
});
