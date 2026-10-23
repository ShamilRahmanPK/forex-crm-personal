import SelectField from '../../components/ui/SelectField'
import TextField from '../../components/ui/TextField'
import { Callout, ChipSelect, CopyValue, Grid, SecretField, Section, ToggleRow } from './fields'
import { useSection } from './useSection'

const PROVIDERS = {
  manual: { label: 'Manual review in this admin', level: null },
  sumsub: { label: 'Sumsub', level: 'Level name' },
  onfido: { label: 'Onfido', level: 'Workflow ID' },
  veriff: { label: 'Veriff', level: 'Integration ID' },
}
const DOCUMENTS = [
  { value: 'passport', label: 'Passport' },
  { value: 'id-card', label: 'National ID card' },
  { value: 'driving-licence', label: 'Driving licence' },
]

export default function KycSettings() {
  const { form, set, save, saving, dirty } = useSection('kyc', { successMessage: 'Verification settings saved' })
  if (!form) return null
  const p = PROVIDERS[form.provider]
  const manual = form.provider === 'manual'
  const docs = Object.entries(form.documents)
    .filter(([, on]) => on)
    .map(([k]) => k)

  return (
    <>
      <Section title="Verification provider" description="Who checks identity and address documents." onSave={save} saving={saving} dirty={dirty}>
        <SelectField
          label="Provider"
          options={Object.entries(PROVIDERS).map(([value, x]) => ({ value, label: x.label }))}
          value={form.provider}
          onChange={(e) => set('provider')(e.target.value)}
        />
        {manual ? (
          <Callout>Documents clients upload wait in ID checks for your compliance team to approve or reject.</Callout>
        ) : (
          <>
            <Grid>
              <SecretField label="API token" value={form.apiToken} onChange={set('apiToken')} />
              <SecretField label="Secret key" value={form.secretKey} onChange={set('secretKey')} />
            </Grid>
            <TextField label={p.level} value={form.levelName} onChange={(e) => set('levelName')(e.target.value)} />
            <CopyValue label="Webhook URL (add this in the provider dashboard)" value={`https://api.yourbroker.com/webhooks/kyc/${form.provider}`} />
            <Callout>The provider&apos;s widget replaces the built-in upload screens in the client portal once your backend issues access tokens for it.</Callout>
          </>
        )}
      </Section>

      <Section title="Rules" onSave={save} saving={saving} dirty={dirty}>
        <div>
          <ToggleRow
            label={manual ? 'Approve documents automatically (demo only)' : 'Approve automatically when the provider returns a clear result'}
            description={manual ? 'Skips staff review. Use only for testing.' : 'Otherwise every result waits for staff confirmation in ID checks.'}
            checked={form.autoApprove}
            onChange={set('autoApprove')}
          />
          <ToggleRow
            label="Require proof of address"
            description="Clients must verify their address to remove deposit limits."
            checked={form.requireAddress}
            onChange={set('requireAddress')}
          />
        </div>
        <ChipSelect
          label="Accepted identity documents"
          options={DOCUMENTS}
          value={docs}
          onChange={(list) => set('documents')(Object.fromEntries(DOCUMENTS.map((d) => [d.value, list.includes(d.value)])))}
        />
      </Section>
    </>
  )
}
