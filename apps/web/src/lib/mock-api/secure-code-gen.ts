import { randomBytes } from 'crypto';
import type { UniqueCode } from './types';

// Safe alphabet excluding confusing characters (0, O, I, 1)
const VALID_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 chars
const CODE_LENGTH = 8; // XXXX-XXXX format

/**
 * Generate cryptographically secure TBAT code using Node.js crypto module
 * Format: TBAT-XXXX-XXXX
 * Entropy: 8 alphanumeric characters (32^8 = ~1 trillion combinations)
 */
export function generateSecureCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = '';
  
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += VALID_CHARS[bytes[i] % VALID_CHARS.length];
  }
  
  return `TBAT-${code.slice(0, 4)}-${code.slice(4, 8)}`;
}

/**
 * Validate TBAT code format (client-side validation)
 * Expected format: TBAT-XXXX-XXXX
 */
export function isValidCodeFormat(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  
  // Remove spaces
  const cleanCode = code.trim();
  
  // Must be already uppercase - no automatic conversion
  if (cleanCode !== cleanCode.toUpperCase()) return false;
  
  // Check basic format: TBAT-XXXX-XXXX
  const formatRegex = /^TBAT-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!formatRegex.test(cleanCode)) return false;
  
  // Extract the 8-character code part (excluding TBAT- prefix)
  const codePart = cleanCode.replace('TBAT-', '').replace('-', '');
  
  // Validate that all characters are in our safe alphabet (must be exactly 8 chars)
  if (codePart.length !== 8) return false;
  
  for (const char of codePart) {
    if (!VALID_CHARS.includes(char)) return false;
  }
  
  return true;
}

/**
 * Format user input for TBAT code entry
 * Automatically adds hyphens and converts to uppercase
 */
export function formatCodeInput(input: string): string {
  // Remove all non-alphanumeric characters except hyphens
  let clean = input.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  
  // Remove existing hyphens to rebuild format
  clean = clean.replace(/-/g, '');
  
  // Handle TBAT prefix
  if (!clean.startsWith('TBAT')) {
    if (clean.length === 0) return '';
    clean = 'TBAT' + clean;
  }
  
  // Remove TBAT prefix for formatting the numeric part
  const withoutPrefix = clean.slice(4);
  
  // Limit to 8 characters max (4-4 format)
  const limited = withoutPrefix.slice(0, 8);
  
  // Add hyphens in the right places
  if (limited.length <= 4) {
    return `TBAT-${limited}`;
  } else {
    return `TBAT-${limited.slice(0, 4)}-${limited.slice(4)}`;
  }
}

/**
 * Generate multiple secure codes for testing/seeding
 */
export function generateMultipleCodes(count: number): UniqueCode[] {
  const codes: UniqueCode[] = [];
  const usedCodes = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let newCode: string;
    
    // Ensure uniqueness (very unlikely collision with crypto.randomBytes)
    do {
      newCode = generateSecureCode();
    } while (usedCodes.has(newCode));
    
    usedCodes.add(newCode);
    
    codes.push({
      id: `code_secure_${i + 1}`,
      code: newCode,
      isUsed: false,
      usedBy: null,
      usedAt: null,
      createdAt: new Date().toISOString(),
      expiresAt: null, // No expiration for now
      validationAttempts: []
    });
  }
  
  return codes;
}