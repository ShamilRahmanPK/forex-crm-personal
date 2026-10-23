// Mock settings API for Admin → Settings.
//
// Secrets follow the production contract: once saved they are never returned,
// only `{ set: true, hint: '••••3f9a' }`. Sending `undefined` for a secret keeps
// the stored value; sending a string replaces it.
//
// MT5 note: the MT5 Manager API is a server-side library. In production the
// "test" and "sync groups" calls below are requests to YOUR backend, which
// connects to MT5 — the browser never talks to an MT5 server directly.
import { DEFAULT_CONFIG, readConfig, writeConfig } from '../services/platformConfig'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))
const uid = (p) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

const SECRET_KEYS = ['password', 'apiKey', 'authToken', 'apiToken', 'secretKey']

const mask = (value) => (value ? { set: true, hint: `••••${String(value).slice(-4)}` } : { set: false, hint: '' })

/** Replace secret values with masks before handing data to the UI. */
function scrub(obj) {
  if (Array.isArray(obj)) return obj.map(scrub)
  if (!obj || typeof obj !== 'object') return obj
  const out = {}
  for (const [k, v] of Object.entries(obj)) out[k] = SECRET_KEYS.includes(k) ? mask(v) : scrub(v)
  return out
}

/** Merge an edit into stored data, keeping secrets the edit left undefined. */
function applySecrets(stored = {}, edit) {
  const out = { ...stored, ...edit }
  for (const k of SECRET_KEYS) {
    if (k in edit && (edit[k] === undefined || typeof edit[k] === 'object')) out[k] = stored[k] ?? ''
  }
  return out
}

function update(section, fn) {
  const config = readConfig()
  const next = { ...config, [section]: fn(config[section]) }
  writeConfig(next)
  return next[section]
}

/* ---------------- Generic sections ---------------- */

export async function getSection(section) {
  await delay(200)
  return scrub(readConfig()[section])
}

export async function saveSection(section, edit) {
  await delay(350)
  return scrub(update(section, (stored) => applySecrets(stored, edit)))
}

export async function resetSection(section) {
  await delay(250)
  return scrub(update(section, () => DEFAULT_CONFIG[section]))
}

/* ---------------- MT5 servers ---------------- */

export async function listServers() {
  await delay(200)
  return scrub(readConfig().servers)
}

export async function saveServer(edit) {
  await delay(350)
  if (!edit.name?.trim()) throw new Error('Give the server a name')
  const servers = update('servers', (list) => {
    if (!edit.id) return [...list, { ...applySecrets({}, edit), id: uid('srv'), status: 'not-tested', groups: [], testedAt: null, syncedAt: null }]
    return list.map((s) => {
      if (s.id !== edit.id) return s
      const changedConnection = s.host !== edit.host || s.port !== edit.port || s.managerLogin !== edit.managerLogin || typeof edit.password === 'string'
      return { ...applySecrets(s, edit), ...(changedConnection ? { status: 'not-tested', statusMessage: null } : {}) }
    })
  })
  return scrub(servers)
}

export async function deleteServer(id) {
  await delay(250)
  const config = readConfig()
  const groupPaths = config.servers.find((s) => s.id === id)?.groups.map((g) => g.path) ?? []
  const inUse = config.accountTypes.filter((t) => groupPaths.includes(t.groups.real) || groupPaths.includes(t.groups.demo))
  if (inUse.length) throw new Error(`Used by ${inUse.map((t) => t.name).join(', ')}. Change their MT5 groups first.`)
  update('servers', (list) => list.filter((s) => s.id !== id))
}

const HOST_RE = /^(?=.{1,253}$)([a-z0-9-]+\.)+[a-z]{2,}$|^(\d{1,3}\.){3}\d{1,3}$/i

/** Simulated MT5 Manager API handshake, with realistic failure messages. */
export async function testServer(id) {
  await delay(1200)
  const server = readConfig().servers.find((s) => s.id === id)
  let result
  if (!server.host || !HOST_RE.test(server.host)) {
    result = { status: 'failed', statusMessage: 'Server address is missing or invalid. Use a host name such as mt5.yourbroker.com.' }
  } else if (!/^\d{3,10}$/.test(String(server.managerLogin))) {
    result = { status: 'failed', statusMessage: 'Manager login must be the numeric MT5 manager account.' }
  } else if (!server.password) {
    result = { status: 'failed', statusMessage: 'Authorization failed: enter the manager password.' }
  } else if (server.host.includes('invalid') || server.host.includes('offline')) {
    result = { status: 'failed', statusMessage: `Connection to ${server.host}:${server.port} timed out after ${server.timeout}s.` }
  } else {
    result = { status: 'connected', statusMessage: `Connected · MT5 build 4755 · ${40 + Math.floor(Math.random() * 60)} ms`, build: 4755 }
  }
  update('servers', (list) => list.map((s) => (s.id === id ? { ...s, ...result, testedAt: new Date().toISOString() } : s)))
  return result
}

function sampleGroups(kind) {
  const prefix = kind === 'demo' ? 'demo' : 'real'
  const rows = [
    ['standard-usd', 'USD', 2000, 60, 0],
    ['standard-eur', 'EUR', 2000, 60, 0],
    ['cent-usc', 'USC', 2000, 60, 0],
    ['pro-usd', 'USD', 500, 50, 30],
    ['pro-swapfree', 'USD', 500, 50, 30],
    ['ib-partners', 'USD', 1000, 60, 20],
  ]
  return rows.map(([name, currency, leverage, marginCall, stopOut]) => ({
    path: `${prefix}\\${name}`,
    currency,
    leverage,
    marginCall: marginCall + 40,
    stopOut,
    accounts: Math.floor(Math.random() * (kind === 'demo' ? 900 : 400)),
  }))
}

export async function syncGroups(id) {
  await delay(1400)
  const server = readConfig().servers.find((s) => s.id === id)
  if (server.status !== 'connected') throw new Error('Test the connection successfully before syncing groups.')
  const groups = sampleGroups(server.kind)
  update('servers', (list) => list.map((s) => (s.id === id ? { ...s, groups, syncedAt: new Date().toISOString() } : s)))
  return groups
}

/** All synced groups, for the account type mapping dropdowns. */
export async function listGroups() {
  await delay(150)
  return readConfig().servers.flatMap((s) => s.groups.map((g) => ({ ...g, serverId: s.id, serverName: s.name, kind: s.kind })))
}

/* ---------------- Account types & payments (list sections) ---------------- */

export async function saveListItem(section, item) {
  await delay(350)
  return scrub(update(section, (list) => list.map((x) => (x.id === item.id ? applySecrets(x, item) : x))))
}

/* ---------------- Email ---------------- */

export async function sendTestEmail(to) {
  await delay(1100)
  const email = readConfig().email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error('Enter a valid email address to send the test to')
  if (!email.fromEmail) throw new Error('Set a sender email address first')
  if (email.provider === 'smtp') {
    if (!email.host) throw new Error('SMTP host is missing')
    if (!email.username || !email.password) throw new Error('SMTP authentication failed: username or password missing')
  } else if (!email.apiKey) {
    throw new Error('API key is missing')
  }
  update('email', (e) => ({ ...e, verifiedAt: new Date().toISOString() }))
  return { message: `Test email sent to ${to}` }
}

export async function saveTemplate(template) {
  await delay(300)
  if (!template.subject.trim()) throw new Error('Subject is required')
  return update('templates', (list) => list.map((t) => (t.id === template.id ? { ...t, ...template } : t)))
}

export async function resetTemplate(id) {
  await delay(200)
  const original = DEFAULT_CONFIG.templates.find((t) => t.id === id)
  return update('templates', (list) => list.map((t) => (t.id === id ? original : t)))
}

/* ---------------- SMS ---------------- */

export async function sendTestSms(phone) {
  await delay(1000)
  const sms = readConfig().sms
  if (!/^\+\d{7,15}$/.test(phone.replace(/[\s-]/g, ''))) throw new Error('Enter the phone number in international format, e.g. +971501234567')
  if (!sms.accountId || !sms.authToken) throw new Error('Provider credentials are missing')
  if (!sms.sender) throw new Error('Set a sender name or number first')
  return { message: `Test SMS sent to ${phone}` }
}
