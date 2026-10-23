export const PASSWORD_RULES = [
  { id: 'length', label: 'Between 8-15 characters', test: (v) => v.length >= 8 && v.length <= 15 },
  { id: 'case', label: 'At least one upper and one lower case letter', test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'number', label: 'At least one number', test: (v) => /\d/.test(v) },
  { id: 'special', label: 'At least one special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

export const isPasswordValid = (value) => PASSWORD_RULES.every((rule) => rule.test(value))

export const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
