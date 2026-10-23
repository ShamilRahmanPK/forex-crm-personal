// Platform configuration managed from Admin → Settings and read by the client
// portal (account types, payment methods, KYC behaviour).
//
// Mock: stored in localStorage. In production this lives in your backend
// database; secrets (passwords, API keys) are stored encrypted server-side and
// never sent back to the browser.
const KEY = 'crm.platform'

export const LEVERAGE_CHOICES = [2, 50, 100, 200, 400, 500, 1000, 2000]

export const DEFAULT_CONFIG = {
  general: {
    legalEntity: 'TradeCRM Ltd',
    registrationNumber: '',
    regulator: '',
    licenceNumber: '',
    baseCurrency: 'USD',
    timezone: 'Asia/Dubai',
    language: 'en',
    supportHours: '24/7',
  },

  servers: [
    { id: 'srv-real', name: 'Live server', kind: 'real', host: '', port: 443, managerLogin: '', password: '', timeout: 10, status: 'not-tested', statusMessage: null, testedAt: null, syncedAt: null, groups: [] },
    { id: 'srv-demo', name: 'Demo server', kind: 'demo', host: '', port: 443, managerLogin: '', password: '', timeout: 10, status: 'not-tested', statusMessage: null, testedAt: null, syncedAt: null, groups: [] },
  ],

  accountTypes: [
    {
      id: 'standard',
      name: 'Standard',
      category: 'Standard accounts',
      icon: 'cube',
      enabled: true,
      badge: 'Recommended',
      description: 'Low entry deposit and zero commission. Suits most traders.',
      minDeposit: 10,
      minSpread: '0.2 pips',
      commission: 'No commission',
      leverages: [50, 100, 200, 500, 1000, 2000],
      defaultLeverage: 200,
      demoBalance: 10000,
      groups: { real: '', demo: '' },
    },
    {
      id: 'cent',
      name: 'Cent',
      category: 'Standard accounts',
      icon: 'coin',
      enabled: true,
      badge: '',
      description: 'Trade in cents with smaller lot sizes. Ideal for practice.',
      minDeposit: 10,
      minSpread: '0.3 pips',
      commission: 'No commission',
      leverages: [50, 100, 200, 500, 1000, 2000],
      defaultLeverage: 200,
      demoBalance: 10000,
      groups: { real: '', demo: '' },
    },
    {
      id: 'pro',
      name: 'Pro',
      category: 'Professional accounts',
      icon: 'gauge',
      enabled: true,
      badge: '',
      description: 'Instant or market execution with tight spreads and no commission.',
      minDeposit: 1000,
      minSpread: '0.1 pips',
      commission: 'No commission',
      leverages: [50, 100, 200, 500],
      defaultLeverage: 200,
      demoBalance: 10000,
      groups: { real: '', demo: '' },
    },
  ],

  payments: [
    { id: 'internal', name: 'Between your accounts', section: 'transfer', icon: 'transfer', provider: 'internal', enabled: true, deposits: true, withdrawals: false, feePct: 0, min: 1, max: 1000000, processing: 'Instant - 1 day', countries: [], apiKey: '' },
    { id: 'usdt-trc20', name: 'Tether (USDT TRC20)', section: 'methods', icon: 'coin', provider: 'nowpayments', enabled: true, deposits: true, withdrawals: true, feePct: 0, min: 10, max: 200000, processing: 'Instant - 15 minutes', countries: [], apiKey: '' },
    { id: 'usdt-bep20', name: 'Tether (USDT BEP20)', section: 'methods', icon: 'coin', provider: 'nowpayments', enabled: true, deposits: true, withdrawals: true, feePct: 0, min: 10, max: 200000, processing: 'Instant - 15 minutes', countries: [], apiKey: '' },
    { id: 'card', name: 'Bank Card', section: 'methods', icon: 'card', provider: 'checkout', enabled: true, deposits: true, withdrawals: true, feePct: 0, min: 10, max: 10000, processing: 'Instant - 30 minutes', countries: [], apiKey: '' },
    { id: 'bank', name: 'Bank Transfer', section: 'methods', icon: 'bank', provider: 'manual', enabled: true, deposits: true, withdrawals: true, feePct: 0, min: 100, max: 100000, processing: '1 - 3 business days', countries: ['AE', 'SA'], apiKey: '' },
    { id: 'btc', name: 'Bitcoin (BTC)', section: 'methods', icon: 'diamond', provider: 'nowpayments', enabled: true, deposits: true, withdrawals: true, feePct: 0, min: 10, max: 100000, processing: 'Instant - 1 hour', countries: [], apiKey: '' },
  ],

  email: {
    provider: 'smtp',
    host: '',
    port: 587,
    encryption: 'tls',
    username: '',
    password: '',
    apiKey: '',
    domain: '',
    region: 'us-east-1',
    fromName: 'TradeCRM',
    fromEmail: '',
    replyTo: '',
    verifiedAt: null,
  },

  templates: [
    { id: 'welcome', name: 'Welcome', enabled: true, subject: 'Welcome to {{company}}', body: 'Hi {{first_name}},\n\nYour {{company}} account is ready. Verify your identity to make your first deposit.\n\n{{portal_link}}\n\nThe {{company}} team' },
    { id: 'email-code', name: 'Email verification code', enabled: true, subject: 'Your {{company}} verification code', body: 'Hi {{first_name}},\n\nYour verification code is {{code}}. It expires in 10 minutes.\n\nIf you did not request this, ignore this email.' },
    { id: 'password-reset', name: 'Password reset', enabled: true, subject: 'Reset your {{company}} password', body: 'Hi {{first_name}},\n\nUse this link to set a new password: {{reset_link}}\n\nThe link expires in 30 minutes.' },
    { id: 'kyc-approved', name: 'Identity approved', enabled: true, subject: 'Your identity is verified', body: 'Hi {{first_name}},\n\nGood news: your documents are approved and deposits are now unlocked.\n\n{{portal_link}}' },
    { id: 'kyc-rejected', name: 'Identity rejected', enabled: true, subject: 'We could not verify your document', body: 'Hi {{first_name}},\n\nWe could not accept your document: {{reason}}.\n\nPlease upload a new one in your account: {{portal_link}}' },
    { id: 'account-opened', name: 'Trading account opened', enabled: true, subject: 'Your new {{account_type}} account', body: 'Hi {{first_name}},\n\nYour {{account_type}} account is ready.\n\nServer: {{server}}\nLogin: {{login}}\n\nSign in to MetaTrader 5 to start trading.' },
    { id: 'deposit-done', name: 'Deposit confirmed', enabled: true, subject: 'Deposit of {{amount}} received', body: 'Hi {{first_name}},\n\nWe have credited {{amount}} to account {{login}}.' },
    { id: 'withdrawal-done', name: 'Withdrawal approved', enabled: true, subject: 'Withdrawal of {{amount}} approved', body: 'Hi {{first_name}},\n\nYour withdrawal of {{amount}} via {{method}} has been approved.' },
  ],

  sms: { enabled: false, provider: 'twilio', accountId: '', authToken: '', sender: '' },

  kyc: {
    provider: 'manual',
    apiToken: '',
    secretKey: '',
    levelName: 'basic-kyc-level',
    autoApprove: false,
    requireAddress: true,
    documents: { passport: true, 'id-card': true, 'driving-licence': true },
  },

  security: { staff2fa: true, sessionTimeout: 30, ipAllowlist: '', minPasswordLength: 8 },
}

function merge(defaults, saved) {
  if (!saved) return defaults
  const out = { ...defaults }
  for (const key of Object.keys(defaults)) {
    if (saved[key] === undefined) continue
    const d = defaults[key]
    out[key] = d && typeof d === 'object' && !Array.isArray(d) ? { ...d, ...saved[key] } : saved[key]
  }
  return out
}

export function readConfig() {
  try {
    return merge(DEFAULT_CONFIG, JSON.parse(localStorage.getItem(KEY)))
  } catch {
    return DEFAULT_CONFIG
  }
}

export function writeConfig(config) {
  try {
    localStorage.setItem(KEY, JSON.stringify(config))
  } catch {
    // ignore
  }
}
