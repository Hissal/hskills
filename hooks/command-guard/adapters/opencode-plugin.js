// OpenCode plugin for the command guard (OpenCode v2 plugin API).
// The installer copies this file to ~/.config/opencode/plugins/command-guard.js.
// It stays tiny on purpose: a plugin file OpenCode cannot load is skipped, so
// everything that can fail lives behind the load below, where failure denies.
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

const home = process.env.COMMAND_GUARD_HOME || path.join(os.homedir(), '.agents', 'command-guard');
let guard = null;
let loadError = null;
try {
  guard = createRequire(import.meta.url)(path.join(home, 'adapters', 'opencode.js'));
} catch (e) {
  loadError = e;
}

function check(sessionID, cwd, command, opts) {
  if (guard) return guard.check(sessionID, cwd, command, opts);
  return 'Command guard: the guard could not be loaded (' + (loadError && loadError.message) + '), so shell calls are stopped. Report this error to the user. Do not disable the guard or work around it: the user stops the session, repairs or disables the guard, and restarts.';
}

export default {
  id: 'command-guard',
  setup: async (ctx) => {
    const cwd = (ctx.location && ctx.location.directory) || null;
    // A rejection here stops the tool call and hands the model the reason.
    await ctx.tool.hook('execute.before', async (event) => {
      const command = event.input && event.input.command;
      if (typeof command !== 'string') return;
      const reason = check(event.sessionID, cwd, command);
      if (reason) throw new Error(reason);
    });
    // Second layer for human-required commands, in case a shell permission is
    // evaluated on a path the tool hook did not see. It leaves reflection alone
    // so a cleared pause is not consumed twice.
    await ctx.permission.hook('evaluate', async (event) => {
      if (event.action !== 'shell') return;
      for (const command of event.resources || []) {
        const reason = check(event.sessionID, cwd, String(command), { reflection: false });
        if (reason) {
          event.effect = 'deny';
          event.message = reason;
          return;
        }
      }
    });
  },
};
