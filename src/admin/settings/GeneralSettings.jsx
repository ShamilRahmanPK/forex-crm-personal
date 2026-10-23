import SelectField from '../../components/ui/SelectField'
import TextField from '../../components/ui/TextField'
import { Grid, Section } from './fields'
import { useSection } from './useSection'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'USDT']
const TIMEZONES = ['UTC', 'Asia/Dubai', 'Europe/London', 'Europe/Limassol', 'Asia/Singapore', 'Asia/Kolkata', 'Africa/Lagos', 'America/New_York']
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
]

export default function GeneralSettings() {
  const { form, set, save, saving, dirty } = useSection('general')
  if (!form) return null
  const text = (key) => ({ value: form[key], onChange: (e) => set(key)(e.target.value) })

  return (
    <>
      <Section title="Legal entity" description="Shown in the client portal footer, emails and documents." onSave={save} saving={saving} dirty={dirty}>
        <Grid>
          <TextField label="Registered company name" {...text('legalEntity')} />
          <TextField label="Registration number" {...text('registrationNumber')} />
          <TextField label="Regulator" placeholder="e.g. Financial Services Authority" {...text('regulator')} />
          <TextField label="Licence number" {...text('licenceNumber')} />
        </Grid>
      </Section>

      <Section title="Regional" description="Defaults for reports, statements and new client accounts." onSave={save} saving={saving} dirty={dirty}>
        <Grid>
          <SelectField label="Base currency" options={CURRENCIES} {...text('baseCurrency')} hint="Used for dashboard totals and reports" />
          <SelectField label="Timezone" options={TIMEZONES} {...text('timezone')} hint="Daily reports and statements cut off at midnight in this timezone" />
          <SelectField label="Default language" options={LANGUAGES} {...text('language')} />
          <TextField label="Support hours" placeholder="e.g. 24/7 or Mon–Fri 08:00–20:00" {...text('supportHours')} />
        </Grid>
      </Section>
    </>
  )
}
