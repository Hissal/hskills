#!/usr/bin/env node
'use strict';
// Codex adapter: PreToolUse on Bash. Codex does not say which shell runs the
// command, so on Windows it is classified as both PowerShell and bash.
// Limitation: Codex continues the tool call when a hook itself fails to run.
require('./hook').run('codex');
