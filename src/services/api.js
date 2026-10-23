// Mock API layer. Each function mirrors the shape a real backend call would
// return, so swapping in fetch() later only touches this file.
import { readConfig } from './platformConfig'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// In the mock, any 6-digit code except this one is accepted.
const MOCK_REJECTED_CODE = '000000'

/* ---------------- Auth ---------------- */

export async function signIn({ email, password }) {
  await delay(500)
  if (!email || !password) throw new Error('Email and password are required')
  return { id: 'u_1', email }
}

export async function signUp({ email, password, partnerCode }) {
  await delay(600)
  if (!email || !password) throw new Error('Email and password are required')
  return { id: 'u_1', email, partnerCode: partnerCode || null }
}

/* ---------------- Trading accounts ---------------- */

let accounts = [
  {
    id: '484035406',
    platform: 'MT5',
    type: 'Standard',
    nickname: 'Standard',
    mode: 'real',
    balance: 0,
    equity: 0,
    floatingPL: 0,
    freeMargin: 0,
    currency: 'USD',
    leverage: 200,
    server: 'TradeCRM-MT5Real01',
    readOnlyAccess: false,
    createdAt: '2026-10-21T07:16:00Z',
  },
  {
    id: '263114870',
    platform: 'MT5',
    type: 'Standard',
    nickname: 'Standard',
    mode: 'demo',
    balance: 10000,
    equity: 10000,
    floatingPL: 0,
    freeMargin: 10000,
    currency: 'USD',
    leverage: 2000,
    server: 'TradeCRM-MT5Trial02',
    readOnlyAccess: false,
    createdAt: '2026-10-21T07:16:00Z',
  },
]

export const LEVERAGE_OPTIONS = [2, 50, 100, 200, 400, 500, 1000, 2000]

export async function getAccounts() {
  await delay(250)
  return accounts.filter((a) => !a.archived)
}

export async function updateAccount(id, patch) {
  await delay(400)
  accounts = accounts.map((a) => (a.id === id ? { ...a, ...patch } : a))
  return accounts.find((a) => a.id === id)
}

export async function changeTradingPassword(id, password) {
  await delay(500)
  if (!password) throw new Error('Password is required')
  return { ok: true }
}

export async function archiveAccount(id) {
  return updateAccount(id, { archived: true })
}

/* ---------------- Open account ---------------- */

const fmtNum = (n) => n.toLocaleString('en-US')

/** Enabled account types from Admin → Settings → Account types, grouped by category. */
export async function getAccountTypes() {
  await delay(200)
  const groups = []
  for (const t of readConfig().accountTypes.filter((x) => x.enabled)) {
    let g = groups.find((x) => x.group === t.category)
    if (!g) groups.push((g = { group: t.category, types: [] }))
    g.types.push({
      id: t.id,
      name: t.name,
      badge: t.badge || undefined,
      icon: t.icon,
      description: t.description,
      minDeposit: `${fmtNum(t.minDeposit)} USD`,
      minSpread: t.minSpread,
      maxLeverage: `1:${Math.max(...t.leverages)}`,
      commission: t.commission,
    })
  }
  return groups
}

export async function createAccount({ typeName, mode }) {
  await delay(600)
  const type = readConfig().accountTypes.find((t) => t.name === typeName)
  const startBalance = mode === 'demo' ? (type?.demoBalance ?? 10000) : 0
  const account = {
    id: String(Math.floor(100000000 + Math.random() * 900000000)),
    platform: 'MT5',
    type: typeName,
    nickname: typeName,
    mode,
    balance: startBalance,
    equity: startBalance,
    floatingPL: 0,
    freeMargin: startBalance,
    currency: 'USD',
    leverage: type?.defaultLeverage ?? 200,
    group: type?.groups[mode] || null,
    server: mode === 'demo' ? 'TradeCRM-MT5Trial02' : 'TradeCRM-MT5Real01',
    readOnlyAccess: false,
    createdAt: new Date().toISOString(),
  }
  accounts = [account, ...accounts]
  return account
}

/* ---------------- Payments ---------------- */

export const COUNTRIES = [
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'EG', name: 'Egypt' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MA', name: 'Morocco' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PH', name: 'Philippines' },
  { code: 'QA', name: 'Qatar' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TR', name: 'Türkiye' },
  { code: 'VN', name: 'Vietnam' },
]

/** Enabled deposit methods from Admin → Settings → Payment methods for a country. */
export async function getDepositMethods(countryCode) {
  await delay(300)
  return readConfig()
    .payments.filter((m) => m.enabled && m.deposits)
    .filter((m) => !m.countries.length || m.countries.includes(countryCode))
    .map((m) => ({
      id: m.id,
      section: m.section,
      name: m.name,
      icon: m.icon,
      processing: m.processing,
      fee: `${m.feePct}%`,
      limits: `${fmtNum(m.min)} - ${fmtNum(m.max)} USD`,
    }))
}

/* ---------------- Verification ---------------- */

export async function sendEmailCode() {
  await delay(400)
  return { resendIn: 60 }
}

export async function sendPhoneCode(phone) {
  await delay(400)
  if (!/^\+?\d{7,15}$/.test(phone.replace(/[\s-]/g, ''))) throw new Error('Enter a valid phone number')
  return { resendIn: 60 }
}

export async function verifyCode(code) {
  await delay(500)
  if (code === MOCK_REJECTED_CODE) throw new Error('The code is incorrect. Try again.')
  return { ok: true }
}

export async function saveProfile(profile) {
  await delay(500)
  return profile
}

export async function submitQuestionnaire(answers) {
  await delay(600)
  return { answers, submittedAt: new Date().toISOString() }
}

/* ---------------- Orders & performance ---------------- */

// Deterministic pseudo-random generator so mock data is stable across reloads.
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const SYMBOLS = [
  { symbol: 'EURUSD', price: 1.085, digits: 5 },
  { symbol: 'GBPUSD', price: 1.27, digits: 5 },
  { symbol: 'USDJPY', price: 149.5, digits: 3 },
  { symbol: 'XAUUSD', price: 2650, digits: 2 },
  { symbol: 'BTCUSD', price: 67000, digits: 2 },
]
const DAY = 86400000

function generateOrders(accountId, count, seed) {
  const rand = seeded(seed)
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const s = SYMBOLS[Math.floor(rand() * SYMBOLS.length)]
    const openTime = now - Math.floor(rand() * 330 * DAY) - DAY
    const closed = i >= 2 // first two stay open
    const side = rand() > 0.5 ? 'buy' : 'sell'
    const volume = Math.round((0.01 + rand() * 0.99) * 100) / 100
    const openPrice = s.price * (1 + (rand() - 0.5) * 0.04)
    const move = (rand() - 0.45) * 0.01
    const closePrice = openPrice * (1 + move)
    const profit = Math.round((side === 'buy' ? 1 : -1) * move * volume * 100000 * 100) / 100
    return {
      id: `${accountId}-${1000 + i}`,
      accountId,
      symbol: s.symbol,
      digits: s.digits,
      side,
      volume,
      openPrice,
      closePrice: closed ? closePrice : null,
      openTime: new Date(openTime).toISOString(),
      closeTime: closed ? new Date(openTime + Math.floor(rand() * 3 * DAY)).toISOString() : null,
      profit,
      commission: -Math.round(volume * 7 * 100) / 100,
      swap: Math.round((rand() - 0.6) * volume * 5 * 100) / 100,
      notional: Math.round(volume * 100000 * (s.price > 100 ? 1 : s.price)),
    }
  })
}

// Only the demo account has trading history in the mock.
const ORDERS = generateOrders('263114870', 40, 42)

const sinceDays = (days) => (days ? Date.now() - days * DAY : 0)

export async function getOrders({ accountId, status, days }) {
  await delay(300)
  const from = sinceDays(days)
  return ORDERS.filter((o) => o.accountId === accountId)
    .filter((o) => (status === 'open' ? !o.closeTime : Boolean(o.closeTime)))
    .filter((o) => new Date(o.closeTime ?? o.openTime).getTime() >= from)
    .sort((a, b) => (b.closeTime ?? b.openTime).localeCompare(a.closeTime ?? a.openTime))
}

/** Aggregates for the Performance page. accountId 'all' = every real account. */
export async function getPerformance({ accountId, days }) {
  await delay(300)
  const ids = accountId === 'all' ? accounts.filter((a) => a.mode === 'real').map((a) => a.id) : [accountId]
  const from = sinceDays(days)
  const mine = ORDERS.filter((o) => ids.includes(o.accountId))
  const closed = mine.filter((o) => o.closeTime && new Date(o.closeTime).getTime() >= from)
  const open = mine.filter((o) => !o.closeTime)
  const sum = (list, fn) => Math.round(list.reduce((t, o) => t + fn(o), 0) * 100) / 100

  // Buckets: daily for <= 31 days, monthly otherwise.
  const monthly = days > 31
  const bucketCount = monthly ? Math.round(days / 30.4) : days
  const now = new Date()
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const back = bucketCount - 1 - i
    const start = monthly ? new Date(now.getFullYear(), now.getMonth() - back, 1) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - back)
    const end = monthly ? new Date(start.getFullYear(), start.getMonth() + 1, 1) : new Date(start.getTime() + DAY)
    const inBucket = closed.filter((o) => {
      const t = new Date(o.closeTime).getTime()
      return t >= start.getTime() && t < end.getTime()
    })
    return {
      label: monthly
        ? start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      netProfit: sum(inBucket, (o) => o.profit + o.commission + o.swap),
      closedOrders: inBucket.length,
      volume: sum(inBucket, (o) => o.notional),
    }
  })

  // Equity: walk back from current equity by subtracting later profits.
  const equityNow = accounts.filter((a) => ids.includes(a.id)).reduce((t, a) => t + a.equity, 0)
  let running = equityNow
  for (let i = buckets.length - 1; i >= 0; i--) {
    buckets[i].equity = Math.round(running * 100) / 100
    running -= buckets[i].netProfit
  }

  const profitable = closed.filter((o) => o.profit > 0)
  return {
    netProfit: sum(closed, (o) => o.profit + o.commission + o.swap),
    profit: sum(profitable, (o) => o.profit),
    loss: sum(closed.filter((o) => o.profit <= 0), (o) => o.profit),
    tradingCost: sum(closed, (o) => o.commission + o.swap),
    unrealisedPL: sum(open, (o) => o.profit),
    closedOrders: closed.length,
    profitableOrders: profitable.length,
    unprofitableOrders: closed.length - profitable.length,
    volume: sum(closed, (o) => o.notional),
    lifetimeVolume: sum(mine.filter((o) => o.closeTime), (o) => o.notional),
    equity: equityNow,
    buckets,
  }
}

/* ---------------- Transfers & transactions ---------------- */

let transactions = []

export async function transferBetweenAccounts({ fromId, toId, amount }) {
  await delay(600)
  const from = accounts.find((a) => a.id === fromId)
  const to = accounts.find((a) => a.id === toId)
  if (!from || !to || fromId === toId) throw new Error('Choose two different accounts')
  if (!(amount > 0)) throw new Error('Enter an amount greater than 0')
  if (amount > from.freeMargin) throw new Error(`The maximum you can transfer is ${from.freeMargin.toFixed(2)} ${from.currency}`)
  const move = (a, delta) => ({ ...a, balance: a.balance + delta, equity: a.equity + delta, freeMargin: a.freeMargin + delta })
  accounts = accounts.map((a) => (a.id === fromId ? move(a, -amount) : a.id === toId ? move(a, amount) : a))
  const tx = {
    id: `TX${Date.now()}`,
    type: 'transfer',
    status: 'done',
    amount,
    currency: from.currency,
    fromId,
    toId,
    accountId: fromId,
    method: 'Between your accounts',
    createdAt: new Date().toISOString(),
  }
  transactions = [tx, ...transactions]
  return tx
}

export async function getTransactions({ days, type, status, accountId }) {
  await delay(300)
  const from = sinceDays(days)
  return transactions
    .filter((t) => new Date(t.createdAt).getTime() >= from)
    .filter((t) => type === 'all' || t.type === type)
    .filter((t) => status === 'all' || t.status === status)
    .filter((t) => accountId === 'all' || t.fromId === accountId || t.toId === accountId)
}

/* ---------------- Support tickets ---------------- */

let tickets = []

export async function getTickets() {
  await delay(250)
  return tickets
}

export async function createTicket({ topic, subject, description, attachment }) {
  await delay(600)
  if (!subject.trim() || !description.trim()) throw new Error('Subject and description are required')
  const ticket = {
    id: String(100000 + tickets.length + 1),
    topic,
    subject: subject.trim(),
    description: description.trim(),
    attachment: attachment?.name ?? null,
    status: 'open',
    createdAt: new Date().toISOString(),
    messages: [{ from: 'client', text: description.trim(), at: new Date().toISOString() }],
  }
  tickets = [ticket, ...tickets]
  return ticket
}

/* ---------------- Identity & address documents ---------------- */

export async function submitIdentityDocuments({ docType, country, files }) {
  await delay(900)
  if (!files.length) throw new Error('Upload at least one file')
  return { status: 'pending', docType, country, submittedAt: new Date().toISOString() }
}

export async function submitAddressDocument({ docType, files }) {
  await delay(900)
  if (!files.length) throw new Error('Upload your document')
  return { status: 'pending', docType, submittedAt: new Date().toISOString() }
}

/* ---------------- Security ---------------- */

export async function changeLoginPassword({ current, next }) {
  await delay(600)
  if (!current) throw new Error('Enter your current password')
  if (current === next) throw new Error('New password must differ from the current one')
  return { ok: true }
}

export async function setTwoFactorMethod(method) {
  await delay(400)
  return { method }
}

export async function logoutOtherDevices() {
  await delay(500)
  return { ok: true }
}

export async function terminateAccount() {
  await delay(800)
  return { ok: true }
}

/* ---------------- Shared with the admin panel (mock backend) ---------------- */

// The admin mock reads and updates the same in-memory stores, so actions on
// one side show up on the other within a session.
export const mockStore = {
  getAccounts: () => accounts,
  getTransactions: () => transactions,
  getTickets: () => tickets,
  updateTicket(id, patch) {
    tickets = tickets.map((t) => (t.id === id ? { ...t, ...patch } : t))
    return tickets.find((t) => t.id === id)
  },
}
