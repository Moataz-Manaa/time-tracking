import { test } from 'node:test';
import assert from 'node:assert/strict';
import { api } from './api.js';

test('API handles interrupted responses and preserves server errors', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('', { status: 502 });
    await assert.rejects(api('auth/register', {}), /temporarily unavailable/);
    globalThis.fetch = async () => new Response('<html>Proxy error</html>', { status: 502 });
    await assert.rejects(api('auth/register', {}), /temporarily unavailable/);
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
    await assert.rejects(api('auth/register', {}), /Could not reach the server/);
    globalThis.fetch = async () => Response.json({ error: 'Email already exists.' }, { status: 409 });
    await assert.rejects(api('auth/register', {}), /Email already exists/);
    globalThis.fetch = async () => Response.json({ user: { name: 'Test' } }, { status: 201 });
    assert.equal((await api('auth/register', {})).user.name, 'Test');
  } finally { globalThis.fetch = original; }
});
