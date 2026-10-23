// Settings sub-navigation. Order is the order shown in the settings menu.
export const SETTINGS_SECTIONS = [
  { group: 'Company', items: [
    { to: 'general', label: 'General' },
    { to: 'branding', label: 'Branding' },
    { to: 'team', label: 'Team' },
  ] },
  { group: 'Trading', items: [
    { to: 'servers', label: 'MT5 servers' },
    { to: 'account-types', label: 'Account types' },
    { to: 'payments', label: 'Payment methods' },
  ] },
  { group: 'Communication', items: [
    { to: 'email', label: 'Email' },
    { to: 'sms', label: 'SMS' },
  ] },
  { group: 'Compliance', items: [
    { to: 'kyc', label: 'Identity verification' },
    { to: 'security', label: 'Security' },
  ] },
]
