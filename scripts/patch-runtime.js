#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Patch all .vc-config.json files under .vercel/output/functions/
const functionsDir = path.join('.vercel', 'output', 'functions');

function patchDir(dir) {
  if (!fs.existsSync(dir)) {
    console.log('patch-runtime: functions dir not found, skipping');
    return;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      patchDir(fullPath);
    } else if (entry.name === '.vc-config.json') {
      const config = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const original = config.runtime;
      if (original !== 'nodejs20.x') {
        config.runtime = 'nodejs20.x';
        fs.writeFileSync(fullPath, JSON.stringify(config, null, 2));
        console.log(`patch-runtime: ${fullPath}: ${original} -> nodejs20.x`);
      }
    }
  }
}

patchDir(functionsDir);
