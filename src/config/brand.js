// Default tenant brand. Everything visual and entity-specific is driven from
// here: logo, colors, fonts, copy and legal text. In production, BrandProvider
// can load a tenant's overrides from your API and deep-merge them on top.
export const defaultBrand = {
  name: 'TradeCRM',
  supportEmail: 'support@example.com',
  supportPhone: '+971 4 000 0000',
  liveChatUrl: null, // e.g. your Intercom/Zendesk chat link; null falls back to email
  // Trading platform shown in the Trade dialog on each account.
  platform: {
    name: 'MetaTrader 5',
    downloadUrl: 'https://www.metatrader5.com/en/download',
  },
  defaultCountry: 'AE', // assumed country of residence until the user sets one

  // Identity checks. 'mock' uses the built-in upload screens
  // (features/verification/DocumentSteps). To use a KYC vendor (Sumsub, Onfido,
  // Veriff…), render its SDK in the 'kyc-consent'/'kyc-upload' views of
  // VerificationFlow and report its result through onComplete('identity', …).
  kyc: {
    provider: 'mock',
    privacyNoticeUrl: '#',
    // true: documents auto-approve after a few seconds (demo without staff).
    // false: they wait in the admin panel's ID checks queue.
    mockAutoApprove: false,
  },
  // Deposit limit (USD) per verification level; null = unlimited.
  depositLimits: { unverified: 0, identity: 2000, full: null },
  copyrightStart: 2024,

  // Logo: text wordmark, or an image. Image wins when `src` is set.
  logo: {
    text: 'tradecrm',
    mark: true, // ring mark before the text wordmark
    src: null, // e.g. '/brand/logo.svg'
    alt: 'TradeCRM',
    height: 32, // px, image logo height in headers (landing uses 1.5x)
  },
  favicon: '/favicon.svg',

  theme: {
    colors: {
      primary: '#ffde02', // main CTA (Trade / Deposit / Continue)
      onPrimary: '#16152b', // text on primary — keep dark on a yellow primary
      text: '#16152b',
      textSecondary: '#5e5c78',
      textMuted: '#8c8aa3',
      background: '#ffffff', // cards, sidebar, header
      page: '#f8f8fb', // portal page background behind cards
      surface: '#f3f3f8', // chips, hover states, icon buttons
      border: '#ececf3',
      link: '#3b49df',
      success: '#15803d',
      danger: '#dc2626',
      warning: '#b26a00', // questionnaire warnings
      banner: '#fff8d6', // verification notice
    },
    fonts: {
      sans: "'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "'Hanken Grotesk', -apple-system, sans-serif", // headings + text logo
      // Stylesheet that loads the fonts above; null if self-hosted/system fonts.
      stylesheet: 'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap',
    },
    radius: {
      sm: '8px', // buttons, inputs
      md: '10px',
      lg: '14px', // cards, dialogs
    },
  },

  copy: {
    landingLead: 'Please sign in or register for full access to {name} content and services.',
    // Onboarding banner, one entry per stage: [title, optional subtitle]
    onboardingBanner: 'Hello. Fill in your account details to make your first deposit',
    bannerProfile: ['Add your profile information', 'Takes about 3-5 minutes'],
    bannerPhone: ['Confirm your phone number', 'Keeps your account secure'],
    bannerIdentity: ['Verify your identity', 'Required before your first deposit'],
    bannerIdentityPending: ['Your documents are under review', 'This usually takes a few minutes'],
    bannerAddress: ['Verify your residential address', 'Unlocks unlimited deposits'],
    bannerAddressPending: ['Your proof of address is under review', 'This usually takes a few minutes'],
    signUpDeclaration: 'I declare and confirm that I am not a citizen or resident of the US for tax purposes.',
  },

  // Short line shown under the landing-page footer rule.
  regulatoryShort:
    'TradeCRM Ltd is a placeholder entity. Replace this text with your registered entity name, registration number, regulator and licence number.',

  // Paragraphs shown in the auth and portal footers.
  regulatoryFull: [
    'TradeCRM does not offer services to residents of certain jurisdictions. The content of this website should not be construed as a means of solicitation. Investors make their own and independent decisions.',
    'Trading in CFDs and generally leveraged products involves substantial risk of loss and you may lose all of your invested capital.',
    'TradeCRM Ltd is a placeholder entity. Replace this paragraph with your registered entity name, registration number, regulator, licence number and registered office address.',
  ],

  legalLinks: {
    auth: [
      { label: 'Privacy Agreement', href: '#' },
      { label: 'Risk disclosure', href: '#' },
      { label: 'Preventing money laundering', href: '#' },
      { label: 'Security instructions', href: '#' },
      { label: 'Legal documents', href: '#' },
      { label: 'Complaints Handling Policy', href: '#' },
    ],
    portal: [
      { label: 'Client Agreement', href: '#' },
      { label: 'General Business Terms', href: '#' },
      { label: 'Partnership Agreement', href: '#' },
      { label: 'Bonus terms and Conditions', href: '#' },
      { label: 'Confidentiality Policy', href: '#' },
      { label: 'Key Facts Statement', href: '#' },
      { label: 'Conflicts of Interest', href: '#' },
      { label: 'Privacy Agreement', href: '#' },
      { label: 'Risk Disclosure', href: '#' },
      { label: 'Preventing Money Laundering', href: '#' },
      { label: 'Complaints Handling Policy', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    signUp: [
      { label: 'Client Agreement', href: '#' },
      { label: 'General Business Terms', href: '#' },
      { label: 'Partnership Agreement', href: '#' },
      { label: 'Privacy Agreement', href: '#' },
    ],
  },
}

/** Replaces {name} placeholders in copy strings. */
export const fillCopy = (text, brand) => text.replaceAll('{name}', brand.name)
