export function isValidIBAN(iban: string): boolean {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,}$/.test(cleanIban)) {
    return false;
  }

  const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
  const numericIban = rearranged.replace(/[A-Z]/g, (char) => 
    (char.charCodeAt(0) - 55).toString()
  );

  let remainder = '';
  for (let i = 0; i < numericIban.length; i++) {
    remainder = (parseInt(remainder + numericIban[i], 10) % 97).toString();
  }

  return parseInt(remainder, 10) === 1;
}

export function formatIBAN(iban: string): string {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  return cleanIban.replace(/(.{4})/g, '$1 ').trim();
}
