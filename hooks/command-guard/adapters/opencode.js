'use strict';
// OpenCode adapter body, loaded by adapters/opencode-plugin.js inside the
// OpenCode server. OpenCode does not say which shell runs the command, so on
// Windows it is classified as both PowerShell and bash.

const { decide, failureMessage } = require('./hook');

// The reason to block `command`, or null. Never throws.
function check(sessionID, cwd, command, opts) {
  try {
    return decide({ session_id: 'opencode:' + sessionID, cwd, tool_input: { command } }, 'opencode', opts);
  } catch (e) {
    return failureMessage(e);
  }
}

module.exports = { check };
