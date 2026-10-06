/**
 * Centralized Password Complexity Validator
 * Rules:
 *  - Minimum 8 characters (max 50)
 *  - At least one uppercase letter (A-Z)
 *  - At least one lowercase letter (a-z)
 *  - At least one number (0-9)
 *  - At least one special character (!@#$%^&*...)
 */

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number (0-9)', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special symbol (!@#$%^&*)', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
];

export function getPasswordRequirements(password = '') {
  return PASSWORD_RULES.map(rule => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(password || '')
  }));
}

export function validatePassword(password = '') {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter (A-Z)' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter (a-z)' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number (0-9)' };
  }
  if (!/[^A-Za-z0-9\s]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
  }
  return { isValid: true, message: '' };
}

export function getPasswordStrength(password = '') {
  if (!password) {
    return { score: 0, text: '', color: 'bg-slate-200', percent: 0 };
  }
  const requirements = getPasswordRequirements(password);
  const metCount = requirements.filter(r => r.met).length;

  if (metCount <= 2) {
    return { score: 1, text: 'Weak', color: 'bg-rose-500', percent: 25 };
  }
  if (metCount === 3) {
    return { score: 2, text: 'Fair', color: 'bg-amber-500', percent: 50 };
  }
  if (metCount === 4) {
    return { score: 3, text: 'Good', color: 'bg-blue-500', percent: 75 };
  }
  return { score: 4, text: 'Strong', color: 'bg-emerald-500', percent: 100 };
}
