// Mock back-office API. Generated clients and transactions live in memory;
// the demo client signed in on the portal (user u_1) is merged in from the
// portal's own mock store and localStorage, so staff actions reach the portal.
import { COUNTRIES, mockStore } from '../services/api'
import { EMPTY_STATUS, VERIFICATION_EVENT, docState, personalDone, verificationKey } from '../features/verification/stages'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))
const DAY = 86400000
const LIVE_ID = 'u_1'

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
const rand = seeded(7)
const pick = (list) => list[Math.floor(rand() * list.length)]
const money = (min, max) => Math.round((min + rand() * (max - min)) * 100) / 100

/* ---------------- Staff & roles ---------------- */

export const ROLES = {
  owner: { label: 'Owner', can: ['dashboard', 'clients', 'kyc', 'transactions', 'tickets', 'settings'] },
  compliance: { label: 'Compliance', can: ['dashboard', 'clients', 'kyc'] },
  finance: { label: 'Finance', can: ['dashboard', 'clients', 'transactions'] },
  support: { label: 'Support', can: ['dashboard', 'clients', 'tickets'] },
}

let staff = [
  { id: 's1', name: 'Amira Haddad', email: 'admin@example.com', role: 'owner', lastActive: new Date().toISOString() },
  { id: 's2', name: 'Daniel Okafor', email: 'compliance@example.com', role: 'compliance', lastActive: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 's3', name: 'Priya Nair', email: 'finance@example.com', role: 'finance', lastActive: new Date(Date.now() - DAY).toISOString() },
  { id: 's4', name: 'Omar Saleh', email: 'support@example.com', role: 'support', lastActive: new Date(Date.now() - 3 * DAY).toISOString() },
]

export async function adminSignIn({ email, password }) {
  await delay(400)
  if (!email || !password) throw new Error('Enter your email and password')
  const member = staff.find((m) => m.email.toLowerCase() === email.trim().toLowerCase())
  // Mock: unknown emails sign in as an owner so the demo is never blocked.
  return member ?? { id: 'sx', name: 'Demo Admin', email: email.trim(), role: 'owner' }
}

export async function listStaff() {
  await delay(200)
  return staff
}

export async function inviteStaff({ name, email, role }) {
  await delay(400)
  if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a name and a valid email')
  if (staff.some((m) => m.email.toLowerCase() === email.toLowerCase())) throw new Error('This person is already on the team')
  const member = { id: `s${Date.now()}`, name: name.trim(), email: email.trim(), role, lastActive: null, invited: true }
  staff = [...staff, member]
  return member
}

export async function updateStaffRole(id, role) {
  await delay(250)
  staff = staff.map((m) => (m.id === id ? { ...m, role } : m))
}

export async function removeStaff(id) {
  await delay(250)
  staff = staff.filter((m) => m.id !== id)
}

/* ---------------- Generated clients ---------------- */

const FIRST = ['Ahmed', 'Fatima', 'Ravi', 'Chen', 'Maria', 'John', 'Aisha', 'Yusuf', 'Sara', 'Omar', 'Lina', 'Arjun', 'Nadia', 'Karim', 'Mei', 'David', 'Hana', 'Ibrahim', 'Zara', 'Ali']
const LAST = ['Khan', 'Rahman', 'Patel', 'Wang', 'Santos', 'Smith', 'Hassan', 'Ali', 'Mendes', 'Nasser', 'Kapoor', 'Sharma', 'Haddad', 'Tan', 'Cohen', 'Yilmaz', 'Mensah', 'Ochieng', 'Farouk', 'Reyes']
const ACCOUNT_TYPES = ['Standard', 'Cent', 'Pro']
const MANAGERS = ['Amira Haddad', 'Omar Saleh', 'Unassigned']

function makeAccount(i, j) {
  const type = pick(ACCOUNT_TYPES)
  const balance = rand() < 0.25 ? 0 : money(50, 25000)
  return { id: String(500000000 + i * 37 + j * 911), type, mode: rand() < 0.15 ? 'demo' : 'real', balance, equity: Math.round(balance * (0.97 + rand() * 0.06) * 100) / 100, leverage: pick([100, 200, 500, 1000, 2000]), currency: 'USD' }
}

let clients = Array.from({ length: 46 }, (_, i) => {
  const first = pick(FIRST)
  const last = pick(LAST)
  const kyc = pick(['approved', 'approved', 'approved', 'pending', 'none', 'none', 'rejected'])
  const registeredAt = new Date(Date.now() - Math.floor(rand() * 200 * DAY) - 3600000).toISOString()
  return {
    id: `C${1001 + i}`,
    firstName: first,
    lastName: last,
    email: `${first}.${last}${i}@mail.example`.toLowerCase(),
    phone: `+971 5${Math.floor(rand() * 10)} ${String(Math.floor(rand() * 9000000) + 1000000)}`,
    country: pick(COUNTRIES).code,
    registeredAt,
    lastLogin: new Date(Date.parse(registeredAt) + Math.floor(rand() * 30 * DAY)).toISOString(),
    status: rand() < 0.06 ? 'suspended' : 'active',
    kyc,
    addressKyc: kyc === 'approved' ? pick(['approved', 'approved', 'pending', 'none']) : 'none',
    manager: pick(MANAGERS),
    accounts: Array.from({ length: 1 + Math.floor(rand() * 3) }, (_, j) => makeAccount(i, j)),
    notes: [],
    kycSubmission:
      kyc === 'pending'
        ? { docType: pick(['passport', 'id-card', 'driving-licence']), country: pick(COUNTRIES).code, submittedAt: new Date(Date.now() - Math.floor(rand() * 3 * DAY)).toISOString(), files: 2 }
        : null,
  }
})

let generatedTx = clients.flatMap((c) =>
  Array.from({ length: Math.floor(rand() * 5) }, (_, k) => {
    const type = rand() < 0.65 ? 'deposit' : 'withdrawal'
    const age = Math.floor(rand() * 40 * DAY)
    const status = age < 2 * DAY && rand() < 0.6 ? 'pending' : rand() < 0.08 ? 'rejected' : 'done'
    return {
      id: `TX${c.id.slice(1)}${k}`,
      clientId: c.id,
      accountId: c.accounts[0].id,
      type,
      method: pick(type === 'deposit' ? ['Bank Card', 'Tether (USDT TRC20)', 'Bank Transfer', 'Bitcoin (BTC)'] : ['Bank Transfer', 'Tether (USDT TRC20)', 'Bank Card']),
      amount: money(20, 5000),
      currency: 'USD',
      status,
      createdAt: new Date(Date.now() - age).toISOString(),
    }
  }),
)

let generatedTickets = [
  ['C1004', 'payments', 'Withdrawal still pending after 2 days'],
  ['C1011', 'verification', 'My ID was rejected, what should I upload?'],
  ['C1017', 'trading', 'Cannot log in to MT5 from my phone'],
  ['C1023', 'account-security', 'Please change my phone number'],
  ['C1030', 'payments', 'Card deposit charged twice'],
  ['C1038', 'platforms', 'MT5 charts not loading on my phone'],
].map(([clientId, topic, subject], i) => ({
  id: String(200001 + i),
  clientId,
  topic,
  subject,
  status: i < 4 ? 'open' : 'resolved',
  createdAt: new Date(Date.now() - (i + 1) * 7 * 3600000).toISOString(),
  messages: [{ from: 'client', text: `${subject}. Can you help?`, at: new Date(Date.now() - (i + 1) * 7 * 3600000).toISOString() }],
}))

/* ---------------- The live demo client (portal user u_1) ---------------- */

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}

function writeVerification(patch) {
  const current = { ...EMPTY_STATUS, ...readJson(verificationKey(LIVE_ID)) }
  const next = { ...current, ...patch }
  try {
    localStorage.setItem(verificationKey(LIVE_ID), JSON.stringify(next))
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(VERIFICATION_EVENT))
}

let liveExtras = { status: 'active', notes: [], manager: 'Unassigned' }

function liveClient() {
  const session = readJson('crm.session')
  if (!session) return null
  const v = { ...EMPTY_STATUS, ...readJson(verificationKey(LIVE_ID)) }
  const profile = typeof v.profile === 'object' ? v.profile : {}
  const kyc = docState(v.identity)
  return {
    id: LIVE_ID,
    live: true,
    firstName: profile.firstName ?? session.email.split('@')[0],
    lastName: profile.lastName ?? '',
    email: session.email,
    phone: typeof v.phone === 'string' ? v.phone : '—',
    country: profile.countryOfBirth ?? 'AE',
    address: profile.address,
    dateOfBirth: profile.year ? `${profile.day}/${profile.month}/${profile.year}` : null,
    registeredAt: new Date(Date.now() - 3600000).toISOString(),
    lastLogin: new Date().toISOString(),
    kyc,
    addressKyc: docState(v.address),
    onboarding: { email: Boolean(v.email), phone: Boolean(v.phone), profile: personalDone(v) },
    kycSubmission: v.identity && typeof v.identity === 'object' ? { files: 2, ...v.identity } : null,
    addressSubmission: v.address && typeof v.address === 'object' ? { files: 1, ...v.address } : null,
    accounts: mockStore.getAccounts().filter((a) => !a.archived).map((a) => ({ ...a, type: a.type })),
    ...liveExtras,
  }
}

const allClients = () => {
  const live = liveClient()
  return live ? [live, ...clients] : clients
}

const fullName = (c) => `${c.firstName} ${c.lastName}`.trim()
const balanceOf = (c) => c.accounts.filter((a) => a.mode === 'real').reduce((t, a) => t + a.balance, 0)

function allTransactions() {
  const live = mockStore.getTransactions().map((t) => ({ ...t, clientId: LIVE_ID }))
  return [...live, ...generatedTx].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function allTickets() {
  const live = mockStore.getTickets().map((t) => ({ ...t, clientId: LIVE_ID, live: true, messages: t.messages ?? [{ from: 'client', text: t.description, at: t.createdAt }] }))
  return [...live, ...generatedTickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

const withClient = (item) => {
  const c = allClients().find((x) => x.id === item.clientId)
  return { ...item, clientName: c ? fullName(c) : item.clientId }
}

/* ---------------- Dashboard ---------------- */

export async function getDashboard() {
  await delay(300)
  const cs = allClients()
  const tx = allTransactions()
  const since = (days) => Date.now() - days * DAY
  const done30 = tx.filter((t) => t.status === 'done' && Date.parse(t.createdAt) >= since(30))
  const sum = (list) => Math.round(list.reduce((s, t) => s + t.amount, 0) * 100) / 100
  const pendingWithdrawals = tx.filter((t) => t.type === 'withdrawal' && t.status === 'pending')
  const kycQueue = await listKyc({ status: 'pending' }, { fast: true })

  const days = Array.from({ length: 14 }, (_, i) => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - (13 - i))
    const end = start.getTime() + DAY
    return {
      label: start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      value: sum(tx.filter((t) => t.type === 'deposit' && t.status === 'done' && Date.parse(t.createdAt) >= start.getTime() && Date.parse(t.createdAt) < end)),
    }
  })

  return {
    totalClients: cs.length,
    newClients7d: cs.filter((c) => Date.parse(c.registeredAt) >= since(7)).length,
    deposits30d: sum(done30.filter((t) => t.type === 'deposit')),
    withdrawals30d: sum(done30.filter((t) => t.type === 'withdrawal')),
    pendingWithdrawals: { count: pendingWithdrawals.length, amount: sum(pendingWithdrawals) },
    pendingKyc: kycQueue.length,
    openTickets: allTickets().filter((t) => t.status === 'open').length,
    depositsByDay: days,
    kycPreview: kycQueue.slice(0, 5),
    withdrawalPreview: pendingWithdrawals.slice(0, 5).map(withClient),
  }
}

/* ---------------- Clients ---------------- */

export async function listClients({ query = '', kyc = 'all', status = 'all', country = 'all', page = 1, pageSize = 12 }) {
  await delay(250)
  const q = query.trim().toLowerCase()
  const rows = allClients()
    .filter((c) => !q || `${fullName(c)} ${c.email} ${c.id} ${c.phone} ${c.accounts.map((a) => a.id).join(' ')}`.toLowerCase().includes(q))
    .filter((c) => kyc === 'all' || c.kyc === kyc)
    .filter((c) => status === 'all' || c.status === status)
    .filter((c) => country === 'all' || c.country === country)
    .map((c) => ({ ...c, name: fullName(c), balance: balanceOf(c) }))
  return { total: rows.length, rows: rows.slice((page - 1) * pageSize, page * pageSize) }
}

export async function getClient(id) {
  await delay(250)
  const c = allClients().find((x) => x.id === id)
  if (!c) throw new Error('Client not found')
  return {
    ...c,
    name: fullName(c),
    balance: balanceOf(c),
    transactions: allTransactions().filter((t) => t.clientId === id),
    tickets: allTickets().filter((t) => t.clientId === id),
  }
}

export async function setClientStatus(id, status) {
  await delay(300)
  if (id === LIVE_ID) liveExtras = { ...liveExtras, status }
  else clients = clients.map((c) => (c.id === id ? { ...c, status } : c))
}

export async function setClientManager(id, manager) {
  await delay(200)
  if (id === LIVE_ID) liveExtras = { ...liveExtras, manager }
  else clients = clients.map((c) => (c.id === id ? { ...c, manager } : c))
}

export async function addClientNote(id, text, author) {
  await delay(250)
  if (!text.trim()) throw new Error('Write a note first')
  const note = { id: `n${Date.now()}`, text: text.trim(), author, at: new Date().toISOString() }
  if (id === LIVE_ID) liveExtras = { ...liveExtras, notes: [note, ...liveExtras.notes] }
  else clients = clients.map((c) => (c.id === id ? { ...c, notes: [note, ...c.notes] } : c))
  return note
}

export const MANAGER_OPTIONS = MANAGERS

/* ---------------- KYC queue ---------------- */

export async function listKyc({ status = 'pending' }, { fast = false } = {}) {
  if (!fast) await delay(250)
  const items = []
  for (const c of allClients()) {
    if (c.kycSubmission && (status === 'all' || c.kyc === status)) {
      items.push({ id: `${c.id}:identity`, clientId: c.id, clientName: fullName(c), kind: 'identity', state: c.kyc, live: Boolean(c.live), ...c.kycSubmission })
    }
    if (c.live && c.addressSubmission && (status === 'all' || c.addressKyc === status)) {
      items.push({ id: `${c.id}:address`, clientId: c.id, clientName: fullName(c), kind: 'address', state: c.addressKyc, live: true, ...c.addressSubmission })
    }
  }
  return items.sort((a, b) => (a.submittedAt ?? '').localeCompare(b.submittedAt ?? ''))
}

export const REJECT_REASONS = [
  'Document is blurry or unreadable',
  'Document has expired',
  'Name does not match the profile',
  'Part of the document is cut off',
  'Document type is not accepted',
  'Proof of address is older than 3 months',
]

export async function decideKyc(itemId, decision, reason) {
  await delay(400)
  const [clientId, kind] = itemId.split(':')
  const state = decision === 'approve' ? 'approved' : 'rejected'
  if (clientId === LIVE_ID) {
    const v = { ...EMPTY_STATUS, ...readJson(verificationKey(LIVE_ID)) }
    const current = typeof v[kind] === 'object' ? v[kind] : {}
    writeVerification({ [kind]: { ...current, status: state, reason: reason ?? null, reviewedAt: new Date().toISOString() } })
    return
  }
  clients = clients.map((c) => (c.id === clientId ? { ...c, kyc: state, kycReason: reason ?? null } : c))
}

/* ---------------- Transactions ---------------- */

export async function listAdminTransactions({ status = 'all', type = 'all', query = '' }) {
  await delay(250)
  const q = query.trim().toLowerCase()
  return allTransactions()
    .map(withClient)
    .filter((t) => status === 'all' || t.status === status)
    .filter((t) => type === 'all' || t.type === type)
    .filter((t) => !q || `${t.id} ${t.clientName} ${t.accountId} ${t.method}`.toLowerCase().includes(q))
}

export async function decideTransaction(id, decision, reason) {
  await delay(400)
  const status = decision === 'approve' ? 'done' : 'rejected'
  generatedTx = generatedTx.map((t) => (t.id === id ? { ...t, status, reason: reason ?? null, reviewedAt: new Date().toISOString() } : t))
}

/* ---------------- Tickets ---------------- */

export async function listAdminTickets({ status = 'all' }) {
  await delay(250)
  return allTickets()
    .map(withClient)
    .filter((t) => status === 'all' || t.status === status)
}

function updateTicket(id, update) {
  const live = mockStore.getTickets().find((t) => t.id === id)
  if (live) return mockStore.updateTicket(id, update({ messages: [{ from: 'client', text: live.description, at: live.createdAt }], ...live }))
  generatedTickets = generatedTickets.map((t) => (t.id === id ? { ...t, ...update(t) } : t))
  return generatedTickets.find((t) => t.id === id)
}

export async function replyToTicket(id, text, author) {
  await delay(350)
  if (!text.trim()) throw new Error('Write a reply first')
  return updateTicket(id, (t) => ({ messages: [...t.messages, { from: 'staff', author, text: text.trim(), at: new Date().toISOString() }] }))
}

export async function setTicketStatus(id, status) {
  await delay(250)
  return updateTicket(id, () => ({ status }))
}
