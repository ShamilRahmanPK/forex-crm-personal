// Appropriateness questionnaire shown after the profile form. Tenants can
// replace this list (e.g. load it from the API) without touching components.
//
// Question types:
//   single  - one option; an option may have `hint`, `warning` (shown when
//             picked, non-blocking) and `followUp` (a required extra select)
//   multi   - one or more options
//   confirm - every statement must be ticked; `[text](href)` renders a link
// `{name}` is replaced with the brand name.

const INDUSTRIES = [
  'Accountancy, Audit & Tax',
  'Administration, Secretarial & HR',
  'Agriculture, Forestry & Fishing',
  'Artificial Intelligence',
  'Arts, Design & Fashion',
  'Banking, Financial Services & Insurance',
  'Construction & Property Development',
  'Education & Training',
  'Energy, Oil & Gas',
  'Engineering & Manufacturing',
  'Government & Public Sector',
  'Healthcare & Pharmaceuticals',
  'Hospitality, Travel & Tourism',
  'Information Technology',
  'Legal Services',
  'Media, Marketing & Communications',
  'Retail & Wholesale',
  'Transport & Logistics',
  'Other',
]

const industry = { label: 'Field or industry', options: INDUSTRIES }
const limitsHint = 'Limits and additional verification may apply'

const AMOUNT_BANDS = [
  { value: 'gt1m', label: 'Above 1,000,000 USD' },
  { value: '500k-1m', label: '500,001 - 1,000,000 USD' },
  { value: '250k-500k', label: '250,001 - 500,000 USD' },
  { value: '100k-250k', label: '100,001 - 250,000 USD' },
  { value: '50k-100k', label: '50,001 - 100,000 USD' },
  { value: 'lt50k', label: 'Below 50,000 USD' },
]

const KNOWLEDGE_WARNING = 'Your answer may affect your ability to continue. Please review your selection.'

export const QUESTIONNAIRE = [
  {
    id: 'purpose',
    type: 'single',
    title: 'What is the main purpose of opening your account?',
    options: [
      { value: 'investment', label: 'Investment' },
      { value: 'hedging', label: 'Hedging' },
      { value: 'speculation', label: 'Speculation' },
    ],
  },
  {
    id: 'employment',
    type: 'single',
    title: 'What is your current employment status?',
    options: [
      { value: 'full-time', label: 'Employed full-time', followUp: industry },
      { value: 'part-time', label: 'Employed part-time', followUp: industry },
      { value: 'self-employed', label: 'Freelancer / Self-employed', followUp: industry },
      { value: 'business-owner', label: 'Business owner', followUp: industry },
      { value: 'retired', label: 'Retired' },
      { value: 'unemployed', label: 'Unemployed', hint: limitsHint },
      { value: 'student', label: 'Student', hint: limitsHint },
    ],
  },
  {
    id: 'sources',
    type: 'multi',
    title: 'Select all your sources of income and wealth',
    subtitle: 'You can select more than one',
    options: [
      { value: 'salary', label: 'Employment & salary income' },
      { value: 'business', label: 'Business income & dividends' },
      { value: 'investments', label: 'Investments in financial assets' },
      { value: 'rental', label: 'Rental income' },
      { value: 'savings', label: 'Savings' },
      { value: 'pension', label: 'Pension & government benefits' },
      { value: 'family', label: 'Partner / family support' },
      { value: 'loans', label: 'Loans, borrowings & gifts' },
      { value: 'inheritance', label: 'Inheritance' },
      { value: 'asset-sale', label: 'Sale of assets (e.g. property, business)' },
    ],
  },
  {
    id: 'liquidWealth',
    type: 'single',
    title: 'What is your estimated total liquid wealth?',
    subtitle: 'Including cash, bank balances and other liquid assets',
    options: AMOUNT_BANDS,
  },
  {
    id: 'annualIncome',
    type: 'single',
    title: 'What is your annual net income?',
    subtitle: 'Your yearly income after taxes and deductions',
    options: AMOUNT_BANDS,
  },
  {
    id: 'investShare',
    type: 'single',
    title: 'What share of your annual income do you plan to invest with {name}?',
    options: [
      { value: 'lt25', label: 'Up to 25%' },
      { value: 'lt50', label: 'Up to 50%' },
      { value: 'gt50', label: 'More than 50%' },
    ],
  },
  {
    id: 'experience',
    type: 'single',
    title: 'How much have you traded CFDs with real money in the past 3 years?',
    options: [
      { value: 'gt100', label: 'More than 100 trades' },
      { value: '40-100', label: '40 - 100 trades' },
      { value: '10-40', label: '10 - 40 trades' },
      { value: 'lt10', label: 'Fewer than 10 trades' },
      { value: 'demo', label: 'Mostly demo trading' },
      { value: 'none', label: 'I have not traded' },
    ],
  },
  {
    id: 'education',
    type: 'single',
    title: 'Do you have relevant education or work experience in financial markets or trading?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'marginKnowledge',
    type: 'single',
    title: 'How much margin is needed to open 1 lot (100,000 EUR/USD) with 1:100 leverage?',
    options: [
      { value: '1000', label: '1,000 EUR' },
      { value: '3000', label: '3,000 EUR', warning: KNOWLEDGE_WARNING },
    ],
  },
  {
    id: 'stopOutKnowledge',
    type: 'single',
    title: 'When can a position be closed automatically by the platform?',
    options: [
      { value: 'insufficient-margin', label: "When I don't have enough funds to keep it open" },
      { value: 'in-profit', label: 'When my position is in profit', warning: KNOWLEDGE_WARNING },
    ],
  },
  {
    id: 'riskConfirmation',
    type: 'confirm',
    title: 'Please consider your financial situation and risk tolerance',
    subtitle:
      'Your answers suggest that trading CFDs may be appropriate for you, but this assessment cannot be exhaustive. Please confirm the following:',
    error: 'Please tick all boxes to continue',
    options: [
      { value: 'losses', label: 'I can afford to absorb potentially significant losses from trading' },
      {
        value: 'disclosures',
        label:
          'I have read and understood the [risk disclosures](#) and key information on the {name} website, and I choose to open a real-money trading account at my own discretion.',
      },
      { value: 'complex', label: 'I understand that CFDs are complex, high-risk products and I may lose all the funds in my trading account.' },
    ],
  },
]
