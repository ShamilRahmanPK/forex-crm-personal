import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../components/Toast'
import { getSection, saveSection } from '../settingsApi'

/**
 * Load/edit/save one settings section. `form` is the working copy, `dirty`
 * tells whether it differs from what was loaded.
 */
export function useSection(section, { successMessage = 'Settings saved' } = {}) {
  const toast = useToast()
  const [saved, setSaved] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getSection(section).then((data) => {
      if (!active) return
      setSaved(data)
      setForm(data)
    })
    return () => {
      active = false
    }
  }, [section])

  const set = useCallback((key) => (value) => setForm((f) => ({ ...f, [key]: value })), [])

  async function save() {
    setSaving(true)
    try {
      const data = await saveSection(section, form)
      setSaved(data)
      setForm(data)
      toast(successMessage)
      return data
    } finally {
      setSaving(false)
    }
  }

  const dirty = Boolean(form && saved && JSON.stringify(form) !== JSON.stringify(saved))
  return { form, setForm, set, save, saving, dirty, reload: () => getSection(section).then((d) => (setSaved(d), setForm(d))) }
}
