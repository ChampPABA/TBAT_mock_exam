# ADR-001: Secure Code Generation for TBAT Box Set Registration

## Status
✅ **APPROVED** - 2025-09-02

## Context

The TBAT Mock Exam Platform requires unique codes distributed in physical Box Sets to control access to the platform. The original implementation used simple, predictable codes (TEST123, VALID456) which created security vulnerabilities and poor user experience.

### Problems with Original Design
- **Security Risk:** Easily guessable codes vulnerable to brute-force attacks
- **UX Issue:** Users entered personal information before code validation
- **Low Entropy:** Only ~10^6 possible combinations, trivially exploitable

### Sprint Change Proposal Impact
Sprint Change Proposal SCP-2025-001 identified these issues during security review and proposed comprehensive improvements to both security and user experience.

## Decision

We will implement a **secure code generation system** with the following specifications:

### 1. Secure Code Format
**New Format:** `TBAT-XXXX-XXXX`
- **Prefix:** "TBAT-" for brand recognition and format validation
- **Entropy:** 8 alphanumeric characters (32^8 = ~1 trillion combinations)
- **Separator:** Hyphens for readability and input formatting
- **Character Set:** Alphanumeric excluding confusing characters (0, O, I, 1)

### 2. Code-First Registration Flow
**New Flow:** Code Validation → User Information → Registration Complete
- Modal-based code verification before form entry
- Real-time validation with 500ms debouncing
- Clear error states and recovery mechanisms
- Prevents wasted time on invalid codes

### 3. Security Enhancements
- **Cryptographically Secure Generation:** Using crypto.randomBytes()
- **Rate Limiting:** 5 attempts per IP per minute for code validation
- **Audit Trail:** Log all code validation attempts
- **One-Time Use:** Codes become invalid after successful registration

## Implementation Details

### Code Generation Algorithm
```typescript
// Secure code generation using Node.js crypto module
import { randomBytes } from 'crypto';

const VALID_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 chars, excluding 0,1,I,O
const CODE_LENGTH = 8; // XXXX-XXXX format

export function generateSecureCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = '';
  
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += VALID_CHARS[bytes[i] % VALID_CHARS.length];
  }
  
  return `TBAT-${code.slice(0, 4)}-${code.slice(4, 8)}`;
}

// Example output: TBAT-A7K9-M3P4
```

### Database Schema Updates
```prisma
model UniqueCode {
  id        String    @id @default(cuid())
  code      String    @unique  // TBAT-XXXX-XXXX format
  isUsed    Boolean   @default(false)
  usedBy    String?   // User ID who activated it
  usedAt    DateTime? // When it was activated
  createdAt DateTime  @default(now())
  expiresAt DateTime? // Optional expiration (future enhancement)
  
  // Audit trail
  validationAttempts CodeValidationAttempt[]
}

model CodeValidationAttempt {
  id          String      @id @default(cuid())
  code        String      // The code that was attempted
  ipAddress   String      // IP address of the attempt
  userAgent   String?     // Browser information
  successful  Boolean     // Whether validation succeeded
  createdAt   DateTime    @default(now())
  uniqueCode  UniqueCode? @relation(fields: [code], references: [code])
}
```

### API Endpoint Implementation
```typescript
// /api/codes/validate
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;
  const clientIp = getClientIp(req);

  // Rate limiting check
  const recentAttempts = await getRecentValidationAttempts(clientIp, 5); // 5 minutes
  if (recentAttempts >= 5) {
    return res.status(429).json({ 
      error: 'Too many attempts. Please try again later.' 
    });
  }

  // Format validation
  if (!isValidCodeFormat(code)) {
    await logValidationAttempt(code, clientIp, false);
    return res.status(400).json({ 
      error: 'Invalid code format. Please use TBAT-XXXX-XXXX format.' 
    });
  }

  // Database lookup
  const uniqueCode = await prisma.uniqueCode.findUnique({
    where: { code: code.toUpperCase() }
  });

  await logValidationAttempt(code, clientIp, !!uniqueCode);

  if (!uniqueCode) {
    return res.status(404).json({ 
      error: 'Code not found. Please check your Box Set package.' 
    });
  }

  if (uniqueCode.isUsed) {
    return res.status(409).json({ 
      error: 'This code has already been used. Please contact support if you need assistance.' 
    });
  }

  // Success response
  return res.status(200).json({
    valid: true,
    codeId: uniqueCode.id,
    message: 'Code is valid and ready for registration.'
  });
}
```

### Frontend Integration with Multi-step Wizard
```typescript
// Registration Modal Component
export function CodeVerificationModal() {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const validateCode = useDebouncedCallback(async (inputCode: string) => {
    if (!isValidCodeFormat(inputCode)) return;
    
    setIsValidating(true);
    setError('');

    try {
      const response = await fetch('/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode })
      });

      const result = await response.json();

      if (response.ok) {
        // Success: proceed to registration form
        onCodeValidated(result.codeId);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsValidating(false);
    }
  }, 500);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ตรวจสอบรหัส Box Set</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Label>รหัสที่ได้รับจาก Box Set</Label>
          <Input
            value={code}
            onChange={(e) => {
              const formatted = formatCodeInput(e.target.value);
              setCode(formatted);
              validateCode(formatted);
            }}
            placeholder="TBAT-XXXX-XXXX"
            className={error ? 'border-red-500' : ''}
          />
          
          {isValidating && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>กำลังตรวจสอบรหัส...</span>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Consequences

### Positive Impacts
- **Enhanced Security:** 1 trillion+ possible combinations prevent brute-force attacks
- **Improved UX:** Code-first validation prevents wasted time on invalid codes
- **Better Monitoring:** Comprehensive audit trail for troubleshooting
- **Scalability:** Secure generation supports large-scale Box Set production

### Implementation Considerations
- **Migration Strategy:** Existing simple codes need gradual deprecation
- **Support Impact:** Clear error messages reduce support burden
- **Printing Requirements:** New format requires Box Set packaging updates
- **Performance:** Code validation API requires optimized database indexing

### Risk Mitigation
- **Rate Limiting:** Prevents abuse while maintaining good UX
- **Clear Error Messages:** Reduces user frustration and support tickets
- **Audit Trail:** Enables investigation of suspicious activities
- **Format Validation:** Client-side validation improves response time

## Related Documents
- Sprint Change Proposal SCP-2025-001
- Front-End Spec Part 11: Registration Wizard Specification
- Security Architecture Documentation
- Database Schema Migration Guide

## Approval
- **Architect:** Winston - Approved 2025-09-02
- **Product Owner:** Pending implementation review
- **Security Review:** Built-in with cryptographic standards
- **UX Review:** Aligned with Part 11 specification

---

*This ADR represents a significant security and UX improvement that addresses critical vulnerabilities identified in the original design while maintaining a smooth user experience.*