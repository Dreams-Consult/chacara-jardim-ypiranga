import {
  formatCPF,
  validateCPF,
  formatPhone,
  formatCurrency,
  parseCurrency,
  mysqlToISO,
  isoToMySQL,
} from '../utils'

describe('Utils - formatCPF', () => {
  it('should format CPF correctly with 11 digits', () => {
    expect(formatCPF('12345678901')).toBe('123.456.789-01')
  })

  it('should handle partial CPF input', () => {
    expect(formatCPF('123')).toBe('123')
    expect(formatCPF('123456')).toBe('123.456')
    expect(formatCPF('123456789')).toBe('123.456.789')
  })

  it('should remove non-numeric characters', () => {
    expect(formatCPF('123.456.789-01')).toBe('123.456.789-01')
    expect(formatCPF('abc123def456ghi789jkl01')).toBe('123.456.789-01')
  })

  it('should handle empty string', () => {
    expect(formatCPF('')).toBe('')
  })
})

describe('Utils - validateCPF', () => {
  it('should validate correct CPF', () => {
    expect(validateCPF('11144477735')).toBe(true)
  })

  it('should validate development CPF', () => {
    expect(validateCPF('99999999998')).toBe(true)
  })

  it('should reject invalid CPF', () => {
    expect(validateCPF('12345678901')).toBe(false)
  })

  it('should reject CPF with all same digits', () => {
    expect(validateCPF('11111111111')).toBe(false)
    expect(validateCPF('00000000000')).toBe(false)
  })

  it('should reject CPF with wrong length', () => {
    expect(validateCPF('123')).toBe(false)
    expect(validateCPF('123456789012')).toBe(false)
  })

  it('should handle formatted CPF', () => {
    expect(validateCPF('111.444.777-35')).toBe(true)
  })
})

describe('Utils - formatPhone', () => {
  it('should format cell phone correctly', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('should format landline correctly', () => {
    expect(formatPhone('1134567890')).toBe('(11) 3456-7890')
  })

  it('should handle partial input', () => {
    expect(formatPhone('11')).toBe('11')
    expect(formatPhone('119')).toBe('(11) 9')
    expect(formatPhone('1198765')).toBe('(11) 9876-5')
  })

  it('should remove non-numeric characters', () => {
    expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321')
  })

  it('should handle empty string', () => {
    expect(formatPhone('')).toBe('')
  })
})

describe('Utils - formatCurrency', () => {
  it('should format integer values', () => {
    expect(formatCurrency(1000)).toBe('1.000,00')
  })

  it('should format decimal values', () => {
    expect(formatCurrency(1234.56)).toBe('1.234,56')
  })

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('0,00')
  })

  it('should format large numbers', () => {
    expect(formatCurrency(1000000)).toBe('1.000.000,00')
  })

  it('should round to 2 decimal places', () => {
    expect(formatCurrency(123.456)).toBe('123,46')
  })
})

describe('Utils - parseCurrency', () => {
  it('should parse formatted currency', () => {
    expect(parseCurrency('1.234,56')).toBe(1234.56)
  })

  it('should parse numbers only', () => {
    expect(parseCurrency('123456')).toBe(1234.56)
  })

  it('should handle empty string', () => {
    expect(parseCurrency('')).toBe(0)
  })

  it('should remove all non-numeric characters', () => {
    expect(parseCurrency('R$ 1.234,56')).toBe(1234.56)
  })

  it('should handle zero', () => {
    expect(parseCurrency('0')).toBe(0)
  })
})

describe('Utils - mysqlToISO', () => {
  it('should convert MySQL datetime to ISO format', () => {
    expect(mysqlToISO('2024-01-15 10:30:00')).toBe('2024-01-15T10:30:00Z')
  })

  it('should handle different times', () => {
    expect(mysqlToISO('2024-12-31 23:59:59')).toBe('2024-12-31T23:59:59Z')
  })
})

describe('Utils - isoToMySQL', () => {
  it('should convert ISO datetime to MySQL format', () => {
    expect(isoToMySQL('2024-01-15T10:30:00Z')).toBe('2024-01-15 10:30:00')
  })

  it('should handle different times', () => {
    expect(isoToMySQL('2024-12-31T23:59:59Z')).toBe('2024-12-31 23:59:59')
  })
})
