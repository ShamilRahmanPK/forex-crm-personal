// Support hub content. Tenants can replace topics and FAQ entries freely.
// `icon` keys map to icons in pages/Support/NewTicketPage (ICONS).
export const TICKET_TOPICS = [
  { id: 'payments', icon: 'coins', title: 'Payments', description: 'Deposit or withdrawal issues, internal transfer problems, unsupported tokens or networks, other.' },
  { id: 'account-security', icon: 'user', title: 'Account and security', description: 'Change personal information, security settings, account access, regulation and legal, SMS and emails.' },
  { id: 'platforms', icon: 'apps', title: 'Platforms', description: 'MetaTrader 5 desktop and mobile apps, charts, login and installation.' },
  { id: 'verification', icon: 'scan', title: 'Account verification', description: 'Rejected proof of identity, rejected proof of residence, other verification questions.' },
  { id: 'trading', icon: 'trading', title: 'Trading', description: 'MT4/MT5 connection issues, execution and slippage, charges, swaps, stop out, pricing.' },
  { id: 'programs', icon: 'gift', title: 'Programs', description: 'Partnership and loyalty programs, rewards, affiliates and general inquiries.' },
]

export const FAQ = [
  { q: 'How long does a deposit take?', a: 'Most methods are instant. Bank transfers can take 1-3 business days.' },
  { q: 'Why is my deposit method locked?', a: 'Payment methods unlock after you verify your identity in Profile → Verification.' },
  { q: 'How do I reset my trading password?', a: 'Open My accounts, expand the account and choose "Change trading password".' },
  { q: 'Which documents can I use to verify my identity?', a: 'A valid passport, national ID card or driving licence showing your full name and photo.' },
  { q: 'How do I transfer between my accounts?', a: 'Go to Payments & wallet → Transfer, choose the source and destination accounts and the amount.' },
  { q: 'What is stop out?', a: 'When your margin level falls below the stop-out level, positions are closed automatically to prevent further losses.' },
]
