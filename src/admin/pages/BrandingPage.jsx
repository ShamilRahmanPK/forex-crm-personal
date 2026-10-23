import { useMemo, useState } from 'react'
import { useToast } from '../../components/Toast'
import Button from '../../components/ui/Button'
import SelectField from '../../components/ui/SelectField'
import TextField from '../../components/ui/TextField'
import Toggle from '../../components/ui/Toggle'
import { defaultBrand } from '../../config/brand'
import { useBrand, useBrandEditor } from '../../context/BrandContext'
import a from '../admin.module.css'
import styles from './Branding.module.css'

const FONTS = ['Hanken Grotesk', 'DM Sans', 'Outfit', 'Plus Jakarta Sans', 'Work Sans', 'Source Sans 3', 'Nunito Sans']
const CORNERS = {
  square: { label: 'Square', radius: { sm: '4px', md: '6px', lg: '8px' } },
  rounded: { label: 'Rounded', radius: { sm: '8px', md: '10px', lg: '14px' } },
  soft: { label: 'Extra rounded', radius: { sm: '12px', md: '16px', lg: '22px' } },
}

const fontStack = (f) => `'${f}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
const fontSheet = (f) => `https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap`
const fontFromStack = (stack) => FONTS.find((f) => stack.includes(f)) ?? FONTS[0]
const cornerFromRadius = (r) => Object.entries(CORNERS).find(([, c]) => c.radius.lg === r.lg)?.[0] ?? 'rounded'

// WCAG relative-luminance contrast between two hex colors.
function contrast(hexA, hexB) {
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const [l1, l2] = [lum(hexA), lum(hexB)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

function ColorField({ id, label, value, onChange, hint }) {
  return (
    <div className={styles.colorField}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.colorControl}>
        <input id={`${id}-picker`} type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} picker`} />
        <input id={id} type="text" value={value} maxLength={7} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange(e.target.value)} />
      </div>
      {hint && <small>{hint}</small>}
    </div>
  )
}

/** Tenant branding editor: edits are previewed live, saved overrides restyle every screen. */
export default function BrandingPage() {
  const toast = useToast()
  const brand = useBrand()
  const editor = useBrandEditor()

  const [form, setForm] = useState(() => ({
    name: brand.name,
    logoText: brand.logo.text,
    mark: brand.logo.mark,
    supportEmail: brand.supportEmail,
    supportPhone: brand.supportPhone,
    primary: brand.theme.colors.primary,
    onPrimary: brand.theme.colors.onPrimary,
    link: brand.theme.colors.link,
    page: brand.theme.colors.page,
    banner: brand.theme.colors.banner,
    font: fontFromStack(brand.theme.fonts.sans),
    corners: cornerFromRadius(brand.theme.radius),
  }))
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))
  const valid = (hex) => /^#[0-9a-fA-F]{6}$/.test(hex)

  const ratio = valid(form.primary) && valid(form.onPrimary) ? contrast(form.primary, form.onPrimary) : null
  const previewStyle = useMemo(
    () => ({
      '--p-primary': valid(form.primary) ? form.primary : brand.theme.colors.primary,
      '--p-on-primary': valid(form.onPrimary) ? form.onPrimary : brand.theme.colors.onPrimary,
      '--p-link': valid(form.link) ? form.link : brand.theme.colors.link,
      '--p-page': valid(form.page) ? form.page : brand.theme.colors.page,
      '--p-banner': valid(form.banner) ? form.banner : brand.theme.colors.banner,
      '--p-radius': CORNERS[form.corners].radius.lg,
      '--p-radius-sm': CORNERS[form.corners].radius.sm,
      fontFamily: fontStack(form.font),
    }),
    [form, brand],
  )

  function save() {
    if (![form.primary, form.onPrimary, form.link, form.page, form.banner].every(valid)) {
      toast('Enter colors as 6-digit hex values, e.g. #FFDE02', { tone: 'info' })
      return
    }
    editor.save({
      name: form.name.trim() || defaultBrand.name,
      supportEmail: form.supportEmail.trim(),
      supportPhone: form.supportPhone.trim(),
      logo: { text: form.logoText.trim() || form.name.trim(), mark: form.mark, alt: form.name.trim() },
      theme: {
        colors: { primary: form.primary, onPrimary: form.onPrimary, link: form.link, page: form.page, banner: form.banner },
        fonts: { sans: fontStack(form.font), display: fontStack(form.font), stylesheet: fontSheet(form.font) },
        radius: CORNERS[form.corners].radius,
      },
    })
    toast('Branding saved. The client portal now uses it.')
  }

  return (
    <div className={a.page}>
      {/* Load the chosen font for the preview before it is saved */}
      <link rel="stylesheet" href={fontSheet(form.font)} />
      <div className={a.twoCol}>
        <div className={a.stack}>
          <section className={a.panel}>
            <div className={a.panelHead}>
              <h2 className={a.panelTitle}>Company</h2>
            </div>
            <div className={`${a.panelBody} ${styles.grid}`}>
              <TextField label="Company name" value={form.name} onChange={(e) => set('name')(e.target.value)} hint="Shown in page titles, emails and legal text" />
              <TextField label="Logo text" value={form.logoText} onChange={(e) => set('logoText')(e.target.value)} />
              <div className={styles.toggleRow}>
                <span>Show ring mark before the logo</span>
                <Toggle checked={form.mark} onChange={set('mark')} label="Show ring mark" />
              </div>
              <TextField label="Support email" type="email" value={form.supportEmail} onChange={(e) => set('supportEmail')(e.target.value)} />
              <TextField label="Support phone" value={form.supportPhone} onChange={(e) => set('supportPhone')(e.target.value)} />
            </div>
          </section>

          <section className={a.panel}>
            <div className={a.panelHead}>
              <h2 className={a.panelTitle}>Look and feel</h2>
            </div>
            <div className={`${a.panelBody} ${styles.grid}`}>
              <ColorField id="c-primary" label="Main color" value={form.primary} onChange={set('primary')} hint="Buttons, active menu item, highlights" />
              <ColorField
                id="c-on-primary"
                label="Text on main color"
                value={form.onPrimary}
                onChange={set('onPrimary')}
                hint={
                  ratio
                    ? // Round down so a value just under 4.5 never displays as "4.5 — too low".
                      `Contrast ${(Math.floor(ratio * 10) / 10).toFixed(1)}:1 ${ratio >= 4.5 ? '— readable' : '— too low, pick a darker or lighter text color'}`
                    : undefined
                }
              />
              <ColorField id="c-link" label="Link color" value={form.link} onChange={set('link')} />
              <ColorField id="c-page" label="Page background" value={form.page} onChange={set('page')} />
              <ColorField id="c-banner" label="Verification notice" value={form.banner} onChange={set('banner')} />
              <SelectField label="Font" options={FONTS} value={form.font} onChange={(e) => set('font')(e.target.value)} />
              <SelectField
                label="Corners"
                options={Object.entries(CORNERS).map(([value, c]) => ({ value, label: c.label }))}
                value={form.corners}
                onChange={(e) => set('corners')(e.target.value)}
              />
            </div>
          </section>

          <div className={a.toolbar}>
            <Button onClick={save}>Save branding</Button>
            <Button
              variant="secondary"
              onClick={() => {
                editor.reset()
                toast('Branding reset to defaults. Reload this page to edit the defaults.')
              }}
              disabled={!editor.saved}
            >
              Reset to defaults
            </Button>
          </div>
        </div>

        <aside className={styles.previewWrap}>
          <p className={a.muted}>Preview</p>
          <div className={styles.preview} style={previewStyle} aria-label="Branding preview">
            <div className={styles.pvSidebar}>
              <div className={styles.pvLogo}>
                {form.mark && <span className={styles.pvMark} />}
                {form.logoText || form.name}
              </div>
              <span className={styles.pvNavActive}>Accounts</span>
              <span className={styles.pvNav}>Deposit</span>
              <span className={styles.pvNav}>Support</span>
            </div>
            <div className={styles.pvMain}>
              <div className={styles.pvNotice}>Verify your identity · 3 of 5 done</div>
              <div className={styles.pvCard}>
                <strong>Standard</strong>
                <span className={styles.pvBalance}>1,250.00 USD</span>
                <div className={styles.pvActions}>
                  <span className={styles.pvPrimary}>Trade</span>
                  <span className={styles.pvSecondary}>Deposit</span>
                </div>
                <span className={styles.pvLink}>Account settings</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
