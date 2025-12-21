// Email validation
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  if (!email) {
    return { isValid: false, message: 'E-Mail-Adresse ist erforderlich.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' };
  }

  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'web.de', 'gmx.de', 'gmx.net', 'icloud.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  // Check for obvious typos like "gmial" instead of "gmail"
  const typoPatterns: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'hotmal.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'yahooo.com': 'yahoo.com',
  };

  if (domain && typoPatterns[domain]) {
    return { 
      isValid: false, 
      message: `Meinten Sie ${email.replace(domain, typoPatterns[domain])}?` 
    };
  }

  return { isValid: true };
}

// Password strength validation
export function validatePasswordStrength(password: string): { 
  isValid: boolean; 
  message?: string;
  score: number;
  strength: 'weak' | 'medium' | 'strong';
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let score = 0;

  if (!password) {
    return { 
      isValid: false, 
      message: 'Passwort ist erforderlich.',
      score: 0,
      strength: 'weak',
      suggestions: ['Geben Sie ein Passwort ein.']
    };
  }

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    suggestions.push('Mindestens 8 Zeichen verwenden.');
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Großbuchstaben hinzufügen.');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Kleinbuchstaben hinzufügen.');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Zahlen hinzufügen.');
  }

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Sonderzeichen hinzufügen (z.B. !@#$%).');
  }

  // Common password patterns to avoid
  const commonPatterns = [
    /^12345/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /letmein/i,
    /admin/i,
    /welcome/i,
  ];

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
  if (hasCommonPattern) {
    score = Math.max(0, score - 2);
    suggestions.push('Vermeiden Sie häufig verwendete Passwörter.');
  }

  const isValid = score >= 4 && password.length >= 8;
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  let message: string | undefined;
  if (!isValid) {
    if (score < 2) {
      message = 'Passwort ist sehr schwach.';
    } else if (score < 4) {
      message = 'Passwort ist zu schwach. ' + suggestions[0];
    }
  }

  return { isValid, message, score, strength, suggestions };
}

// Name validation
export function validateName(name: string, fieldName: string = 'Name'): { isValid: boolean; message?: string } {
  if (!name || !name.trim()) {
    return { isValid: false, message: `${fieldName} ist erforderlich.` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, message: `${fieldName} muss mindestens 2 Zeichen haben.` };
  }

  // Check for invalid characters (allow letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-ZäöüÄÖÜß\s\-']+$/.test(name.trim())) {
    return { isValid: false, message: `${fieldName} enthält ungültige Zeichen.` };
  }

  return { isValid: true };
}

// Phone validation
export function validatePhone(phone: string): { isValid: boolean; message?: string } {
  if (!phone) {
    return { isValid: true }; // Phone is optional
  }

  // Remove spaces, dashes, and parentheses for validation
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Check if it's a valid phone format (with or without country code)
  if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
    return { isValid: false, message: 'Bitte geben Sie eine gültige Telefonnummer ein.' };
  }

  return { isValid: true };
}

// Postal code validation (German)
export function validatePostalCode(code: string): { isValid: boolean; message?: string } {
  if (!code) {
    return { isValid: false, message: 'Postleitzahl ist erforderlich.' };
  }

  if (!/^[0-9]{5}$/.test(code.trim())) {
    return { isValid: false, message: 'Bitte geben Sie eine gültige 5-stellige Postleitzahl ein.' };
  }

  return { isValid: true };
}

// Address validation
export function validateAddress(address: string): { isValid: boolean; message?: string } {
  if (!address || !address.trim()) {
    return { isValid: false, message: 'Adresse ist erforderlich.' };
  }

  if (address.trim().length < 5) {
    return { isValid: false, message: 'Bitte geben Sie eine vollständige Adresse ein.' };
  }

  return { isValid: true };
}
