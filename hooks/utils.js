const fs = require('fs');
const path = require('path');
const os = require('os');

function expandTilde(inputPath) {
  if (inputPath && inputPath.startsWith('~/')) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return inputPath;
}

function resolveConfigDir(cwd) {
  const localClaudeDir = path.join(cwd, '.claude');
  if (fs.existsSync(path.join(localClaudeDir, 'get-shit-done'))) {
    return localClaudeDir;
  }
  const envDir = expandTilde(process.env.CLAUDE_CONFIG_DIR);
  if (envDir && fs.existsSync(envDir)) {
    return envDir;
  }
  return path.join(os.homedir(), '.claude');
}

module.exports = { resolveConfigDir };
