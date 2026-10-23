import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { defaultBrand } from '../config/brand'

const BrandContext = createContext(defaultBrand)

// theme.colors key -> CSS custom property. Hover/active shades are derived in
// tokens.css with color-mix(), so a tenant only has to supply base colors.
const COLOR_VARS = {
  primary: '--color-primary',
  onPrimary: '--color-on-primary',
  text: '--color-text',
  textSecondary: '--color-text-secondary',
  textMuted: '--color-text-muted',
  background: '--color-bg',
  page: '--color-page',
  surface: '--color-surface',
  border: '--color-border',
  link: '--color-link',
  success: '--color-success',
  danger: '--color-danger',
  warning: '--color-warning',
  banner: '--color-banner',
}

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v)

function deepMerge(base, override) {
  if (!isObject(override)) return base
  const out = { ...base }
  for (const [key, value] of Object.entries(override)) {
    out[key] = isObject(value) && isObject(base[key]) ? deepMerge(base[key], value) : value
  }
  return out
}

function applyTheme(brand) {
  const root = document.documentElement
  const { colors, fonts, radius } = brand.theme

  for (const [key, cssVar] of Object.entries(COLOR_VARS)) {
    if (colors[key]) root.style.setProperty(cssVar, colors[key])
  }
  root.style.setProperty('--font-sans', fonts.sans)
  root.style.setProperty('--font-display', fonts.display)
  for (const [key, value] of Object.entries(radius)) {
    root.style.setProperty(`--radius-${key}`, value)
  }
}

function useHeadLink(rel, href, id) {
  useEffect(() => {
    let link = document.getElementById(id)
    if (!href) {
      link?.remove()
      return
    }
    if (!link) {
      link = document.createElement('link')
      link.id = id
      link.rel = rel
      document.head.appendChild(link)
    }
    link.href = href
  }, [rel, href, id])
}

// Mock tenant store: brand edits saved from the admin Branding page. A real
// deployment would PUT these to the tenant API and load them via `loadBrand`.
const SAVED_KEY = 'crm.brand.saved'
const BrandEditorContext = createContext(null)

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) ?? null
  } catch {
    return null
  }
}

/**
 * Applies a brand to the whole app. Pass `overrides` (a partial brand) or a
 * `loadBrand` async function, e.g. fetching the tenant's config by hostname:
 *   loadBrand={() => fetch(`/api/tenants/${location.hostname}/brand`).then(r => r.json())}
 */
export function BrandProvider({ overrides, loadBrand, children }) {
  const [remote, setRemote] = useState(null)
  const [saved, setSaved] = useState(readSaved)

  // Pick up edits saved from the admin in another tab.
  useEffect(() => {
    const onStorage = (e) => e.key === SAVED_KEY && setSaved(readSaved())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (!loadBrand) return
    let active = true
    loadBrand()
      .then((data) => active && setRemote(data))
      .catch((err) => console.error('Failed to load brand, using defaults', err))
    return () => {
      active = false
    }
  }, [loadBrand])

  const brand = useMemo(
    () => deepMerge(deepMerge(deepMerge(defaultBrand, overrides), remote), saved),
    [overrides, remote, saved],
  )

  const editor = useMemo(
    () => ({
      saved,
      save(next) {
        try {
          localStorage.setItem(SAVED_KEY, JSON.stringify(next))
        } catch {
          // ignore
        }
        setSaved(next)
      },
      reset() {
        try {
          localStorage.removeItem(SAVED_KEY)
        } catch {
          // ignore
        }
        setSaved(null)
      },
    }),
    [saved],
  )

  // Layout effect so colors are in place before first paint.
  useLayoutEffect(() => applyTheme(brand), [brand])
  useHeadLink('stylesheet', brand.theme.fonts.stylesheet, 'brand-fonts')
  useHeadLink('icon', brand.favicon, 'brand-favicon')
  useEffect(() => {
    document.title = brand.name
  }, [brand.name])

  return (
    <BrandEditorContext.Provider value={editor}>
      <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>
    </BrandEditorContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBrand = () => useContext(BrandContext)

/** Saved tenant overrides + save/reset, for the admin Branding page. */
// eslint-disable-next-line react-refresh/only-export-components
export const useBrandEditor = () => useContext(BrandEditorContext)
