import SelectField from '../../components/ui/SelectField'
import { Grid, Section, ToggleRow } from './fields'
import styles from './Settings.module.css'
import { useSection } from './useSection'

const TIMEOUTS = [15, 30, 60, 120, 480].map((m) => ({ value: String(m), label: m < 60 ? `${m} minutes` : `${m / 60} hour${m > 60 ? 's' : ''}` }))
const LENGTHS = [8, 10, 12, 14].map((n) => ({ value: String(n), label: `${n} characters` }))

export default function SecuritySettings() {
  const { form, set, save, saving, dirty } = useSection('security', { successMessage: 'Security settings saved' })
  if (!form) return null

  const ips = form.ipAllowlist
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const invalid = ips.filter((ip) => !/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip))

  return (
    <Section title="Staff access" description="Applies to everyone who signs in to this back office." onSave={save} saving={saving} dirty={dirty && !invalid.length}>
      <ToggleRow
        label="Require two-step verification for staff"
        description="Staff confirm each sign-in with a code from an authenticator app."
        checked={form.staff2fa}
        onChange={set('staff2fa')}
      />
      <Grid>
        <SelectField label="Sign staff out after inactivity" options={TIMEOUTS} value={String(form.sessionTimeout)} onChange={(e) => set('sessionTimeout')(Number(e.target.value))} />
        <SelectField
          label="Minimum client password length"
          options={LENGTHS}
          value={String(form.minPasswordLength)}
          onChange={(e) => set('minPasswordLength')(Number(e.target.value))}
        />
      </Grid>
      <div className={styles.field}>
        <label htmlFor="ip-allowlist" className={styles.label}>
          Admin IP allowlist
        </label>
        <textarea
          id="ip-allowlist"
          rows={4}
          className={styles.textarea}
          value={form.ipAllowlist}
          onChange={(e) => set('ipAllowlist')(e.target.value)}
          placeholder={'One per line, e.g.\n203.0.113.10\n198.51.100.0/24'}
        />
        <small className={invalid.length ? styles.resultErr : styles.hint}>
          {invalid.length
            ? `Not a valid IPv4 address or range: ${invalid.join(', ')}`
            : ips.length
              ? `Only ${ips.length} address${ips.length > 1 ? 'es' : ''} can open the admin. Make sure yours is included.`
              : 'Empty: the admin can be opened from any IP.'}
        </small>
      </div>
    </Section>
  )
}
