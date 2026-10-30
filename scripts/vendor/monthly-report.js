#!/usr/bin/env node
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');
const MARKER = '<!-- skill-collection:monthly-vendor-drift -->';
const TITLE = 'chore(vendoring): review the monthly drift report';

function publishReport({ github, report, status, errors = '' }) {
  if (status !== 0 && status !== 2) throw new Error('drift script did not complete');
  const lines = report.trim().split('\n').filter(Boolean);
  const summary = status !== 0 ? 'Drift check failed; the report may be incomplete.'
    : lines.length === 0 ? 'No vendored entries.'
      : lines.every((line) => line.endsWith(': current')) ? 'All vendored entries are current.'
        : 'Review the drift classes below.';
  const body = [MARKER, summary, '', '```text', ...lines, '```',
    ...(errors ? ['', 'Diagnostics:', '```text', errors.trim(), '```'] : [])].join('\n');
  const issue = github.listIssues().filter((i) => !i.pull_request && (i.body || '').includes(MARKER))
    .sort((a, b) => a.number - b.number)[0];
  if (issue) github.updateIssue(issue.number, { title: TITLE, body, state: 'open' });
  else github.createIssue({ title: TITLE, body });
}

function githubClient(repo) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo || '')) throw new Error('GITHUB_REPOSITORY must be owner/repo');
  function api(method, suffix, fields) {
    const args = ['api', '--method', method, 'repos/' + repo + '/issues' + suffix];
    if (fields) args.push('--input', '-');
    else args.push('--paginate', '--slurp');
    const result = spawnSync('gh', args, { encoding: 'utf8', input: fields && JSON.stringify(fields) });
    if (result.status !== 0) throw new Error(result.stderr || 'GitHub request failed');
    return JSON.parse(result.stdout);
  }
  return {
    listIssues: () => api('GET', '?state=all&per_page=100').flat(),
    createIssue: (fields) => api('POST', '', fields),
    updateIssue: (number, fields) => api('PATCH', '/' + number, fields)
  };
}

if (require.main === module) {
  try {
    const result = spawnSync(process.execPath, [path.join(__dirname, 'drift.js')], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    publishReport({ github: githubClient(process.env.GITHUB_REPOSITORY), report: result.stdout || '', status: result.status, errors: result.stderr || '' });
    process.exitCode = result.status;
  } catch (error) {
    console.error('ERROR: ' + error.message);
    process.exitCode = 2;
  }
}
module.exports = { publishReport };
