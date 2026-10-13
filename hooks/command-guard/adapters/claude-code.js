#!/usr/bin/env node
'use strict';
// Claude Code adapter: PreToolUse on Bash|PowerShell|Monitor, with onFailure: "block".
require('./hook').run('claude-code');
