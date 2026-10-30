#!/usr/bin/env node
'use strict';
// Fixture-only evidence capture. Raw streams stay in a private scratch directory.
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const [directory, host, command, ...args] = process.argv.slice(2);
fs.mkdirSync(directory, {recursive:true, mode:0o700});
const prefix = path.join(directory, `${host}-${Date.now()}-${process.pid}`);
const run = spawnSync(command, args, {encoding:'utf8', timeout:115000, maxBuffer:16*1024*1024});
for (const key of ['stdout','stderr']) fs.writeFileSync(prefix+'.'+key, run[key] || '', {mode:0o600});
fs.writeFileSync(prefix+'.json', JSON.stringify({command:[command,...args],cwd:process.cwd(),status:run.status,error:run.error?.message}), {mode:0o600});
process.stdout.write(run.stdout || '');
process.stderr.write(run.stderr || '');
process.exitCode = run.status ?? 2;
