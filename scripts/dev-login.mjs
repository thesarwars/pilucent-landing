#!/usr/bin/env node
/**
 * Local sign-in without the pricing site.
 *
 * The app does not sign anyone in itself: /auth/signin and every logout send
 * the browser to `${NEXT_PUBLIC_REDIRECT_URL}/pricing`, which hands tokens
 * back to /auth?tkn=…&rt=…. Locally there is no pricing site, so this asks the
 * API for tokens and prints that hand-off URL to open instead.
 *
 *   npm run dev:login
 *
 * Reads NEXT_PUBLIC_API_URL / NEXT_PUBLIC_APP_URL from the environment or
 * .env.local (defaults: http://localhost:8000/api/v1, http://localhost:3000).
 */

import fs from 'node:fs';
import readline from 'node:readline';

function fromEnvFile(name) {
  try {
    const line = fs
      .readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
      .split('\n')
      .find((l) => l.startsWith(`${name}=`));
    return line ? line.slice(name.length + 1).trim() : undefined;
  } catch {
    return undefined;
  }
}

const API = (process.env.NEXT_PUBLIC_API_URL || fromEnvFile('NEXT_PUBLIC_API_URL') || 'http://localhost:8000/api/v1').replace(/\/+$/, '');
const APP = (process.env.NEXT_PUBLIC_APP_URL || fromEnvFile('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000').replace(/\/+$/, '');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
const lines = rl[Symbol.asyncIterator]();

async function ask(question, hidden = false) {
  process.stdout.write(question);
  if (hidden && process.stdin.isTTY) {
    rl._writeToOutput = () => {}; // keep the password off the screen
  }
  const { value } = await lines.next();
  rl._writeToOutput = (s) => process.stdout.write(s);
  if (hidden) process.stdout.write('\n');
  return (value ?? '').trim();
}

const email = await ask('Email: ');
const password = await ask('Password: ', true);
rl.close();

const res = await fetch(`${API}/accounts/auth/token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
}).catch((err) => {
  console.error(`Could not reach ${API}: ${err.message}`);
  process.exit(1);
});
const body = await res.json().catch(() => ({}));
if (!res.ok || !body.access) {
  console.error(`Sign-in refused (${res.status}): ${body.detail || JSON.stringify(body)}`);
  process.exit(1);
}

const url = `${APP}/auth?tkn=${encodeURIComponent(body.access)}&rt=${encodeURIComponent(body.refresh)}`;
console.log('\nOpen this in the browser (it stores the session and goes to the dashboard):\n');
console.log(url);
