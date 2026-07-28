#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const configPath = path.join('.vercel', 'output', 'functions', '_render.func', '.vc-config.json');

if (!fs.existsSync(configPath)) {
  console.log('patch-runtime: .vc-config.json not found, skipping');
  process.exit(0);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const original = config.runtime;
config.runtime = 'nodejs20.x';
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`patch-runtime: changed runtime ${original} -> nodejs20.x`);
