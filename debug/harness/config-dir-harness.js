#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-config-dir-'));
const envClaudeDir = path.join(tmpDir, '.claude-custom');
const envCacheDir = path.join(envClaudeDir, 'cache');

fs.mkdirSync(envCacheDir, { recursive: true });
fs.writeFileSync(
  path.join(envCacheDir, 'gsd-update-check.json'),
  JSON.stringify({ update_available: true })
);

const statuslineFromEnv = spawnSync(
  process.execPath,
  [path.join(__dirname, '..', '..', 'hooks', 'statusline.js')],
  {
    env: { ...process.env, CLAUDE_CONFIG_DIR: envClaudeDir },
    input: JSON.stringify({
      model: { display_name: 'Claude' },
      workspace: { current_dir: process.cwd() },
      session_id: 'session-test',
      context_window: { remaining_percentage: 99 }
    }),
    encoding: 'utf8'
  }
);

assert(
  statuslineFromEnv.status === 0,
  `statusline exited ${statuslineFromEnv.status}: ${statuslineFromEnv.stderr}`
);
assert(
  statuslineFromEnv.stdout.includes('/gsd:update'),
  'expected statusline to read cache from CLAUDE_CONFIG_DIR'
);

const localWorkspace = path.join(tmpDir, 'workspace');
const localClaudeDir = path.join(localWorkspace, '.claude');
const localCacheDir = path.join(localClaudeDir, 'cache');

fs.mkdirSync(path.join(localClaudeDir, 'get-shit-done'), { recursive: true });
fs.mkdirSync(localCacheDir, { recursive: true });
fs.writeFileSync(
  path.join(localCacheDir, 'gsd-update-check.json'),
  JSON.stringify({ update_available: true })
);
fs.writeFileSync(
  path.join(envCacheDir, 'gsd-update-check.json'),
  JSON.stringify({ update_available: false })
);

const statuslineFromLocal = spawnSync(
  process.execPath,
  [path.join(__dirname, '..', '..', 'hooks', 'statusline.js')],
  {
    cwd: localWorkspace,
    env: { ...process.env, CLAUDE_CONFIG_DIR: envClaudeDir },
    input: JSON.stringify({
      model: { display_name: 'Claude' },
      workspace: { current_dir: localWorkspace },
      session_id: 'session-test',
      context_window: { remaining_percentage: 99 }
    }),
    encoding: 'utf8'
  }
);

assert(
  statuslineFromLocal.status === 0,
  `statusline exited ${statuslineFromLocal.status}: ${statuslineFromLocal.stderr}`
);
assert(
  statuslineFromLocal.stdout.includes('/gsd:update'),
  'expected statusline to prefer local .claude when present'
);

console.log('config-dir harness passed');
