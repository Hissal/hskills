'use strict';
// Shell lexers for the command guard. They split a command string into
// pipelines of simple commands for bash, PowerShell and cmd.exe.
// These are small policy lexers, not interpreters: syntax they do not know
// degrades to plain words and never throws.

const BASH_KEYWORDS = new Set(['if', 'then', 'else', 'elif', 'fi', 'do', 'done', 'while', 'until', 'time', '!', '{', '}']);
const BASH_DECL = new Set(['export', 'declare', 'local', 'readonly', 'typeset']);
const ASSIGN = /^([A-Za-z_][A-Za-z0-9_]*)=/;

function newWord() {
  return { text: '', quoted: false, q0: false, dynamic: false, glob: false, subs: [], varName: null, parts: 0 };
}

function newCmd(shell) {
  return { shell, words: [], redirects: [], stdinText: null, raw: '', pipeline: null, index: 0 };
}

// Index of the bracket closing the one opened just before `start`.
function matchClose(src, start, shell, open, close) {
  let depth = 1;
  const esc = shell === 'powershell' ? '`' : shell === 'cmd' ? '^' : '\\';
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === esc) { i++; continue; }
    if (c === "'" && shell !== 'cmd') {
      const j = src.indexOf("'", i + 1);
      if (j < 0) return src.length;
      i = j;
      continue;
    }
    if (c === '"') {
      i++;
      while (i < src.length && src[i] !== '"') { if (src[i] === esc) i++; i++; }
      continue;
    }
    if (c === open) depth++;
    else if (c === close && --depth === 0) return i;
  }
  return src.length;
}

class Lexer {
  // st: { vars: Map, env(name), home, cwd, tmp, all: [], unq: [] }
  constructor(src, shell, st, top) {
    this.src = src;
    this.shell = shell;
    this.st = st;
    this.top = top;
    this.i = 0;
    this.pipelines = [];
    this.pipeline = [];
    this.cmd = newCmd(shell);
    this.word = null;
    this.redir = null;
    this.cmdStart = 0;
    this.heredocs = [];
  }

  w() {
    if (!this.word) this.word = newWord();
    return this.word;
  }

  unq(s) {
    if (this.top) this.st.unq.push(s);
  }

  add(s, quoted) {
    const w = this.w();
    if (quoted && w.parts === 0) w.q0 = true;
    if (quoted) w.quoted = true;
    w.text += s;
    w.parts++;
  }

  addValue(v, name) {
    const w = this.w();
    if (w.parts === 0 && name) w.varName = name;
    else w.varName = null;
    w.text += v.text;
    w.parts++;
    if (v.dynamic) w.dynamic = true;
    if (v.subs) w.subs.push(...v.subs);
  }

  lookup(name) {
    const st = this.st;
    const key = this.shell === 'bash' ? name : name.toLowerCase();
    if (st.vars.has(key)) return st.vars.get(key);
    if (this.shell === 'bash') {
      if (name === 'HOME') return { text: st.homeText };
      if (name === 'PWD') return st.cwdText == null ? null : { text: st.cwdText };
      const v = st.env(name);
      // Git Bash sets TMPDIR itself, so the hook's Windows environment lacks it
      if (v == null && name === 'TMPDIR' && st.gitBash) return { text: st.tmpText };
      return v == null ? null : { text: v };
    }
    if (key === 'home') return { text: st.homeText };
    if (key === 'pwd') return st.cwdText == null ? null : { text: st.cwdText };
    if (key === 'null' || key === 'true' || key === 'false') return { text: '$' + name };
    return null;
  }

  sub(inner, shell) {
    const lx = new Lexer(inner, shell || this.shell, this.st, false);
    return lx.run();
  }

  endWord() {
    const w = this.word;
    if (!w) return;
    this.word = null;
    if (this.redir) {
      this.cmd.redirects.push({ op: this.redir, word: w });
      if (this.redir === '<<<') this.cmd.stdinText = w.text;
      this.redir = null;
      return;
    }
    if (this.shell === 'bash' && !w.quoted && this.cmd.words.length === 0 && BASH_KEYWORDS.has(w.text)) return;
    this.cmd.words.push(w);
  }

  endCmd() {
    this.endWord();
    const cmd = this.cmd;
    cmd.raw = this.src.slice(this.cmdStart, this.i);
    this.cmd = newCmd(this.shell);
    this.redir = null;
    if (!cmd.words.length && !cmd.redirects.length) return;
    this.assignments(cmd);
    if (!cmd.words.length && !cmd.redirects.length) return;
    cmd.pipeline = this.pipeline;
    cmd.index = this.pipeline.length;
    this.pipeline.push(cmd);
  }

  endPipeline() {
    this.endCmd();
    if (this.pipeline.length) {
      this.pipelines.push(this.pipeline);
      this.st.all.push(this.pipeline);
    }
    this.pipeline = [];
  }

  setVar(name, w, text) {
    const key = this.shell === 'bash' ? name : name.toLowerCase();
    this.st.vars.set(key, { text, dynamic: w.dynamic, subs: w.subs.slice() });
  }

  assignments(cmd) {
    const ws = cmd.words;
    if (this.shell === 'bash') {
      let k = 0;
      if (ws.length > 1 && BASH_DECL.has(ws[0].text)) k = 1;
      let n = k;
      while (n < ws.length && !ws[n].q0 && ASSIGN.test(ws[n].text)) n++;
      if (n === ws.length && n > k) {
        for (let j = k; j < n; j++) {
          const m = ASSIGN.exec(ws[j].text);
          this.setVar(m[1], ws[j], ws[j].text.slice(m[0].length));
        }
        cmd.words = [];
      } else if (k === 0 && n > 0) {
        cmd.words = ws.slice(n);
      }
      return;
    }
    if (this.shell === 'powershell' && ws.length >= 3 && ws[0].varName && ws[1].text === '=' && !ws[1].quoted) {
      const rest = ws.slice(2);
      if (rest.length === 1 && !rest[0].subs.length) {
        this.setVar(ws[0].varName, rest[0], rest[0].text);
        cmd.words = [];
      } else {
        // The right-hand side runs as a command; remember it as the value's source.
        cmd.words = rest;
        this.st.vars.set(ws[0].varName.toLowerCase(), { text: '$' + ws[0].varName, dynamic: true, subs: [[[cmd]]] });
      }
    }
  }

  run() {
    try {
      if (this.shell === 'powershell') this.runPowerShell();
      else if (this.shell === 'cmd') this.runCmd();
      else this.runBash();
    } catch (e) {
      // Keep what was lexed so far.
    }
    this.i = this.src.length;
    this.endPipeline();
    return this.pipelines;
  }

  // ---- bash -------------------------------------------------------------

  bashDollar(inQuotes) {
    const s = this.src;
    const n = s[this.i + 1];
    if (n === '(' && s[this.i + 2] === '(') {
      const end = s.indexOf('))', this.i + 3);
      const stop = end < 0 ? s.length : end + 2;
      this.add(s.slice(this.i, stop), inQuotes);
      this.w().dynamic = true;
      this.i = stop;
      return;
    }
    if (n === '(') {
      const end = matchClose(s, this.i + 2, 'bash', '(', ')');
      const inner = s.slice(this.i + 2, end);
      const pipes = this.sub(inner);
      const one = pipes.length === 1 && pipes[0].length === 1 ? pipes[0][0] : null;
      if (one && one.words[0] && one.words[0].text === 'mktemp') {
        this.add(this.st.tmpText + '/guard-mktemp', inQuotes);
      } else {
        this.add('$(' + inner + ')', inQuotes);
        this.w().dynamic = true;
      }
      this.w().subs.push(pipes);
      this.unq('$(' + inner + ')');
      this.i = end + 1;
      return;
    }
    if (n === '{') {
      const end = s.indexOf('}', this.i + 2);
      const body = s.slice(this.i + 2, end < 0 ? s.length : end);
      this.i = end < 0 ? s.length : end + 1;
      const v = /^[A-Za-z_][A-Za-z0-9_]*$/.test(body) ? this.lookup(body) : null;
      if (v) this.addValue(v);
      else { this.add('${' + body + '}', inQuotes); this.w().dynamic = true; }
      return;
    }
    const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(this.i + 1, this.i + 200));
    if (m) {
      this.i += 1 + m[0].length;
      const v = this.lookup(m[0]);
      if (v) this.addValue(v);
      else { this.add('$' + m[0], inQuotes); this.w().dynamic = true; }
      return;
    }
    if (n && /[0-9@*#?!$-]/.test(n)) {
      this.add('$' + n, inQuotes);
      this.w().dynamic = true;
      this.i += 2;
      return;
    }
    this.add('$', inQuotes);
    this.i++;
  }

  bashBacktick(inQuotes) {
    const s = this.src;
    let j = this.i + 1;
    while (j < s.length && s[j] !== '`') { if (s[j] === '\\') j++; j++; }
    const inner = s.slice(this.i + 1, j);
    this.add('`' + inner + '`', inQuotes);
    this.w().dynamic = true;
    this.w().subs.push(this.sub(inner));
    this.unq('`' + inner + '`');
    this.i = j + 1;
  }

  readHeredocs() {
    const s = this.src;
    for (const h of this.heredocs) {
      let body = '';
      while (this.i < s.length) {
        let e = s.indexOf('\n', this.i);
        if (e < 0) e = s.length;
        let line = s.slice(this.i, e);
        this.i = Math.min(e + 1, s.length);
        if ((h.strip ? line.replace(/^\t+/, '') : line).replace(/\r$/, '') === h.delim) break;
        body += line + '\n';
      }
      h.cmd.stdinText = (h.cmd.stdinText || '') + body;
    }
    this.heredocs = [];
    this.cmdStart = this.i;
  }

  runBash() {
    const s = this.src;
    const n = s.length;
    while (this.i < n) {
      const c = s[this.i];
      const two = s.substr(this.i, 2);
      if (c === '\\') {
        if (s[this.i + 1] === '\n') { this.i += 2; continue; }
        if (s[this.i + 1] === '\r' && s[this.i + 2] === '\n') { this.i += 3; continue; }
        this.add(s[this.i + 1] || '', true);
        this.unq(' ');
        this.i += 2;
        continue;
      }
      if (c === "'") {
        let j = s.indexOf("'", this.i + 1);
        if (j < 0) j = n;
        this.add(s.slice(this.i + 1, j), true);
        this.unq(' ');
        this.i = j + 1;
        continue;
      }
      if (c === '$' && s[this.i + 1] === "'") {
        let j = this.i + 2;
        let out = '';
        while (j < n && s[j] !== "'") {
          if (s[j] === '\\' && j + 1 < n) { j++; out += s[j] === 'n' ? '\n' : s[j] === 't' ? '\t' : s[j]; } else out += s[j];
          j++;
        }
        this.add(out, true);
        this.unq(' ');
        this.i = j + 1;
        continue;
      }
      if (c === '"' || (c === '$' && s[this.i + 1] === '"')) {
        this.i += c === '$' ? 2 : 1;
        this.add('', true);
        while (this.i < n && s[this.i] !== '"') {
          const d = s[this.i];
          if (d === '\\' && /[$`"\\\n]/.test(s[this.i + 1] || '')) {
            if (s[this.i + 1] !== '\n') this.add(s[this.i + 1], true);
            this.i += 2;
          } else if (d === '$') this.bashDollar(true);
          else if (d === '`') this.bashBacktick(true);
          else { this.add(d, true); this.i++; }
        }
        this.unq(' ');
        this.i++;
        continue;
      }
      if (c === '$') { this.bashDollar(false); continue; }
      if (c === '`') { this.bashBacktick(false); continue; }
      if ((c === '<' || c === '>') && s[this.i + 1] === '(' ) {
        const end = matchClose(s, this.i + 2, 'bash', '(', ')');
        const inner = s.slice(this.i + 2, end);
        const w = this.w();
        w.text += c + '(' + inner + ')';
        w.parts++;
        w.dynamic = true;
        w.procsub = true;
        w.subs.push(this.sub(inner));
        this.unq(c + '(' + inner + ')');
        this.i = end + 1;
        continue;
      }
      if (c === '<' || c === '>') {
        if (this.word && !this.word.quoted && /^[0-9]+$/.test(this.word.text)) this.word = null;
        else this.endWord();
        if (s.substr(this.i, 3) === '<<<') { this.redir = '<<<'; this.i += 3; this.unq('<<<'); continue; }
        if (two === '<<') {
          let j = this.i + 2;
          const strip = s[j] === '-';
          if (strip) j++;
          while (s[j] === ' ' || s[j] === '\t') j++;
          let delim = '';
          while (j < n && !/[\s;|&<>()]/.test(s[j])) {
            if (s[j] === "'" || s[j] === '"') {
              const q = s[j];
              let k = s.indexOf(q, j + 1);
              if (k < 0) k = n;
              delim += s.slice(j + 1, k);
              j = k + 1;
            } else { if (s[j] === '\\') j++; delim += s[j] || ''; j++; }
          }
          this.heredocs.push({ cmd: this.cmd, delim, strip });
          this.i = j;
          continue;
        }
        let op = c;
        this.i++;
        if (s[this.i] === '>' || s[this.i] === '|') { op += s[this.i]; this.i++; }
        if (s[this.i] === '&') {
          this.i++;
          // fd duplication such as 2>&1: not a file target
          const m = /^[0-9-]+/.exec(s.slice(this.i, this.i + 8));
          if (m) { this.i += m[0].length; this.unq(op); continue; }
        }
        this.redir = op;
        this.unq(op);
        continue;
      }
      if (c === '#' && !this.word) {
        let e = s.indexOf('\n', this.i);
        this.i = e < 0 ? n : e;
        continue;
      }
      if (c === '\n') {
        this.endPipeline();
        this.i++;
        this.unq('\n');
        if (this.heredocs.length) this.readHeredocs();
        this.cmdStart = this.i;
        continue;
      }
      if (c === ' ' || c === '\t' || c === '\r') { this.endWord(); this.i++; this.unq(' '); continue; }
      if (two === '&&' || two === '||' || two === ';;') { this.endPipeline(); this.i += 2; this.cmdStart = this.i; this.unq(two); continue; }
      if (two === '&>') {
        this.endWord();
        this.i += 2;
        if (s[this.i] === '>') this.i++;
        this.redir = '>';
        continue;
      }
      if (two === '|&') { this.endCmd(); this.i += 2; this.cmdStart = this.i; this.unq('|'); continue; }
      if (c === '|') { this.endCmd(); this.i++; this.cmdStart = this.i; this.unq('|'); continue; }
      if (c === ';' || c === '&' || c === '(' || c === ')') { this.endPipeline(); this.i++; this.cmdStart = this.i; this.unq(c); continue; }
      if (c === '~' && !this.word && /^(\/|\s|$|[;&|)])/.test(s.slice(this.i + 1, this.i + 2))) {
        this.add(this.st.homeText, false);
        this.i++;
        this.unq('~');
        continue;
      }
      if (c === '*' || c === '?' || c === '[') this.w().glob = true;
      this.add(c, false);
      this.unq(c);
      this.i++;
    }
  }

  // ---- PowerShell -------------------------------------------------------

  psDollar(inQuotes) {
    const s = this.src;
    const n = s[this.i + 1];
    if (n === '(') {
      const end = matchClose(s, this.i + 2, 'powershell', '(', ')');
      const inner = s.slice(this.i + 2, end);
      this.add('$(' + inner + ')', inQuotes);
      this.w().dynamic = true;
      this.w().subs.push(this.sub(inner));
      this.i = end + 1;
      return;
    }
    let name = null;
    let len = 0;
    if (n === '{') {
      const end = s.indexOf('}', this.i + 2);
      name = s.slice(this.i + 2, end < 0 ? s.length : end);
      len = (end < 0 ? s.length : end + 1) - this.i;
    } else {
      const m = /^(?:[A-Za-z_][A-Za-z0-9_]*:)?[A-Za-z_][A-Za-z0-9_]*|^[_?^$]/.exec(s.slice(this.i + 1, this.i + 200));
      if (m) { name = m[0]; len = 1 + m[0].length; }
    }
    if (name == null) { this.add('$', inQuotes); this.i++; return; }
    this.i += len;
    let v = null;
    const env = /^env:(.+)$/i.exec(name);
    if (env) {
      const val = this.st.env(env[1]);
      v = val == null ? null : { text: val };
    } else if (!/:/.test(name)) v = this.lookup(name);
    // a member access or index makes the value unknowable here
    const member = !inQuotes && /^(\.[A-Za-z_]|\[)/.test(s.slice(this.i, this.i + 2));
    if (v && !member) { this.addValue(v, name); return; }
    this.add('$' + name, inQuotes);
    const w = this.w();
    if (w.parts === 1 && !env) w.varName = name;
    w.dynamic = true;
    if (v && v.subs) w.subs.push(...v.subs);
  }

  runPowerShell() {
    const s = this.src;
    const n = s.length;
    while (this.i < n) {
      const c = s[this.i];
      const two = s.substr(this.i, 2);
      if (c === '`') {
        if (s[this.i + 1] === '\n') { this.i += 2; continue; }
        if (s[this.i + 1] === '\r' && s[this.i + 2] === '\n') { this.i += 3; continue; }
        this.add(s[this.i + 1] || '', true);
        this.i += 2;
        continue;
      }
      if (!this.word && (two === "@'" || two === '@"') && /^\r?\n/.test(s.slice(this.i + 2, this.i + 4))) {
        const q = s[this.i + 1];
        const m = new RegExp('\\n' + q + '@').exec(s.slice(this.i + 2));
        const end = m ? this.i + 2 + m.index : n;
        this.add(s.slice(s.indexOf('\n', this.i) + 1, end).replace(/\r$/, ''), true);
        this.i = m ? end + 3 : n;
        continue;
      }
      if (c === "'") {
        let out = '';
        let j = this.i + 1;
        while (j < n) {
          if (s[j] === "'") { if (s[j + 1] === "'") { out += "'"; j += 2; continue; } break; }
          out += s[j++];
        }
        this.add(out, true);
        this.unq(' ');
        this.i = j + 1;
        continue;
      }
      if (c === '"') {
        this.i++;
        this.add('', true);
        while (this.i < n) {
          const d = s[this.i];
          if (d === '"') { if (s[this.i + 1] === '"') { this.add('"', true); this.i += 2; continue; } break; }
          if (d === '`') { this.add(s[this.i + 1] || '', true); this.i += 2; } else if (d === '$') this.psDollar(true);
          else { this.add(d, true); this.i++; }
        }
        this.unq(' ');
        this.i++;
        continue;
      }
      if (c === '$') { this.psDollar(false); continue; }
      if (two === '<#') {
        const e = s.indexOf('#>', this.i + 2);
        this.i = e < 0 ? n : e + 2;
        continue;
      }
      if (c === '#' && !this.word) {
        const e = s.indexOf('\n', this.i);
        this.i = e < 0 ? n : e;
        continue;
      }
      if (c === '(' || c === '{' || ((c === '@') && (s[this.i + 1] === '(' || s[this.i + 1] === '{'))) {
        if (c === '@') this.i++;
        const open = s[this.i];
        const end = matchClose(s, this.i + 1, 'powershell', open, open === '(' ? ')' : '}');
        const inner = s.slice(this.i + 1, end);
        const fresh = !this.word;
        const w = this.w();
        w.text += open + inner + (open === '(' ? ')' : '}');
        w.parts++;
        w.dynamic = true;
        if (open === '{') w.block = true;
        w.subs.push(this.sub(inner));
        if (!fresh) w.varName = null;
        this.unq(open + inner);
        this.i = end + 1;
        continue;
      }
      if (c === '=' && this.word && this.word.varName && this.word.parts === 1 && !this.cmd.words.length && s[this.i + 1] !== '=') {
        // $name=value without spaces is still an assignment
        this.endWord();
        this.add('=', false);
        this.endWord();
        this.i++;
        continue;
      }
      if (c === '\n') { this.endPipeline(); this.i++; this.cmdStart = this.i; this.unq('\n'); continue; }
      if (c === ' ' || c === '\t' || c === '\r' || c === ',') { this.endWord(); this.i++; this.unq(' '); continue; }
      if (two === '&&' || two === '||') { this.endPipeline(); this.i += 2; this.cmdStart = this.i; continue; }
      if (c === '|') { this.endCmd(); this.i++; this.cmdStart = this.i; this.unq('|'); continue; }
      if (c === ';' || c === ')' || c === '}') { this.endPipeline(); this.i++; this.cmdStart = this.i; this.unq(c); continue; }
      if (c === '&') {
        // call operator at command start, background operator elsewhere
        if (this.word || this.cmd.words.length) this.endPipeline();
        this.i++;
        continue;
      }
      if (c === '>' || (!this.word && /^[0-9*]>/.test(two))) {
        this.endWord();
        if (c !== '>') this.i++;
        this.i++;
        if (s[this.i] === '>') this.i++;
        if (s[this.i] === '&') { this.i += 2; continue; }
        this.redir = '>';
        continue;
      }
      if (c === '~' && !this.word && /^([\\/]|\s|$|[;|)}])/.test(s.slice(this.i + 1, this.i + 2))) {
        this.add(this.st.homeText, false);
        this.i++;
        continue;
      }
      if (c === '@' && !this.word && /[A-Za-z_]/.test(s[this.i + 1] || '')) {
        this.w().dynamic = true;
        this.w().splat = true;
      }
      if (c === '*' || c === '?') this.w().glob = true;
      this.add(c, false);
      this.unq(c);
      this.i++;
    }
  }

  // ---- cmd.exe ----------------------------------------------------------

  runCmd() {
    const s = this.src;
    const n = s.length;
    const percent = (inQuotes) => {
      const m = /^%([^%\s]+)%/.exec(s.slice(this.i, this.i + 200));
      if (!m) {
        this.add('%', inQuotes);
        if (/^%(~|\d|\*)/.test(s.slice(this.i, this.i + 2))) this.w().dynamic = true;
        this.i++;
        return;
      }
      this.i += m[0].length;
      const name = m[1].toLowerCase();
      const v = name === 'cd' ? this.st.cwdText : this.st.env(m[1]);
      if (v == null) { this.add(m[0], inQuotes); this.w().dynamic = true; } else this.add(v, inQuotes);
    };
    while (this.i < n) {
      const c = s[this.i];
      const two = s.substr(this.i, 2);
      if (c === '^') { this.add(s[this.i + 1] || '', true); this.i += 2; continue; }
      if (c === '"') {
        this.i++;
        this.add('', true);
        while (this.i < n && s[this.i] !== '"') {
          if (s[this.i] === '%') percent(true);
          else { this.add(s[this.i], true); this.i++; }
        }
        this.unq(' ');
        this.i++;
        continue;
      }
      if (c === '%') { percent(false); continue; }
      if (c === '\n') { this.endPipeline(); this.i++; this.cmdStart = this.i; continue; }
      if (c === ' ' || c === '\t' || c === '\r') { this.endWord(); this.i++; this.unq(' '); continue; }
      if (two === '&&' || two === '||') { this.endPipeline(); this.i += 2; this.cmdStart = this.i; this.unq(two); continue; }
      if (c === '|') { this.endCmd(); this.i++; this.cmdStart = this.i; this.unq('|'); continue; }
      if (c === '&' || c === '(' || c === ')') { this.endPipeline(); this.i++; this.cmdStart = this.i; this.unq(c); continue; }
      if (c === '>' || c === '<') {
        if (this.word && /^[0-9]$/.test(this.word.text)) this.word = null;
        else this.endWord();
        this.i++;
        if (s[this.i] === '>') this.i++;
        if (s[this.i] === '&') { this.i += 2; continue; }
        this.redir = c;
        continue;
      }
      if (c === '*' || c === '?') this.w().glob = true;
      this.add(c, false);
      this.unq(c);
      this.i++;
    }
  }
}

// Lex `src`. Returns every pipeline found, nested ones included, in the order
// they were completed, plus the source text with quoted spans blanked.
function lex(src, shell, opts) {
  const st = {
    vars: new Map(),
    env: opts.env,
    homeText: opts.homeText,
    cwdText: opts.cwdText,
    tmpText: opts.tmpText,
    gitBash: !!opts.gitBash,
    all: [],
    unq: [],
  };
  const lx = new Lexer(String(src), shell, st, true);
  const top = lx.run();
  return { pipelines: st.all, top, unquoted: st.unq.join('') };
}

module.exports = { lex };
