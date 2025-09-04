# Component Library Integration with Variant 6 Design System

## Document Overview

**Purpose:** Define the integration approach for shadcn/ui component library with the Variant 6 design system selected in SCP-2025-001.

**Status:** ✅ **APPROVED** - Architect Review Complete  
**Related:** Sprint Change Proposal SCP-2025-001, Front-End Spec Part 11  
**Version:** 1.0 - 2025-09-02  

---

## Variant 6 Design System Specifications

### Color Palette & Design Tokens

**Selected Theme:** Medical Green Professional Theme
- **Primary Brand Color:** `#0d7276` (Medical teal - trust and professionalism)
- **Secondary Accent:** `#529a94` (Supporting green for actions)
- **Background Tint:** `#90bfc0` (Light green for sections)
- **Surface Color:** `#cae0e1` (Subtle background)
- **Base White:** `#fdfefe` (Card and content backgrounds)

### Tailwind CSS Configuration

```typescript
// tailwind.config.js - Variant 6 Integration
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './packages/ui/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Variant 6 TBAT Brand Colors
        tbat: {
          primary: '#0d7276',      // Main CTAs, active states
          secondary: '#529a94',    // Secondary actions
          accent: '#90bfc0',       // Backgrounds, highlights
          bg: '#cae0e1',          // Section backgrounds
          light: '#fdfefe',       // Card backgrounds
        },
        // Override shadcn/ui default colors with medical theme
        primary: {
          DEFAULT: '#0d7276',
          50: '#f0f9f9',
          100: '#daf1f1',
          200: '#b9e3e4',
          300: '#90bfc0',
          400: '#529a94',
          500: '#0d7276',
          600: '#0a5d61',
          700: '#084d50',
          800: '#063e41',
          900: '#053336',
        },
        // Semantic colors maintained for consistency
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        // Google Fonts Prompt integration for Thai typography
        'prompt': ['Prompt', 'sans-serif'],
        'sans': ['Prompt', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        // Custom animations for registration wizard
        'modal-up': 'modalUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'shake': 'shake 0.4s ease-in-out',
      },
      keyframes: {
        modalUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
  ],
};
```

---

## shadcn/ui Component Customization

### Base Component Configuration

```typescript
// components.json - shadcn/ui config with Variant 6 theming
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### Global CSS Variables (Variant 6 Theme)

```css
/* app/globals.css - Variant 6 CSS Variables */
@import url('https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

@layer base {
  :root {
    /* Variant 6 Primary Colors */
    --background: 253 254 254;           /* #fdfefe - Base white */
    --foreground: 55 65 81;              /* #374151 - Text */
    --card: 253 254 254;                 /* #fdfefe - Card background */
    --card-foreground: 55 65 81;         /* #374151 - Card text */
    --popover: 253 254 254;              /* #fdfefe - Popover background */
    --popover-foreground: 55 65 81;      /* #374151 - Popover text */
    
    /* TBAT Brand Primary */
    --primary: 13 114 118;               /* #0d7276 - Main brand */
    --primary-foreground: 253 254 254;   /* #fdfefe - Text on primary */
    
    /* TBAT Secondary */
    --secondary: 202 224 225;            /* #cae0e1 - Section backgrounds */
    --secondary-foreground: 13 114 118;  /* #0d7276 - Text on secondary */
    
    /* TBAT Accent */
    --accent: 144 191 192;               /* #90bfc0 - Highlights */
    --accent-foreground: 13 114 118;     /* #0d7276 - Text on accent */
    
    /* State Colors */
    --success: 34 197 94;                /* #22c55e - Success states */
    --warning: 245 158 11;               /* #f59e0b - Warning states */
    --destructive: 239 68 68;            /* #ef4444 - Error states */
    --destructive-foreground: 253 254 254; /* #fdfefe - Text on destructive */
    
    /* Borders and Inputs */
    --border: 229 231 235;               /* #e5e7eb - Border color */
    --input: 229 231 235;                /* #e5e7eb - Input border */
    --ring: 13 114 118;                  /* #0d7276 - Focus ring */
    
    /* Radius */
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground font-prompt;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  /* Thai text optimization */
  .thai-text {
    font-family: 'Prompt', sans-serif;
    line-height: 1.6;
    letter-spacing: 0.01em;
  }
}
```

---

## Registration Wizard Component Integration

### Enhanced Modal Component (Code Verification)

```typescript
// components/ui/registration-modal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCodeValidated: (codeId: string) => void;
}

export function RegistrationModal({ isOpen, onOpenChange, onCodeValidated }: RegistrationModalProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-modal-up">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-semibold text-tbat-primary thai-text">
            ตรวจสอบรหัส Box Set
          </DialogTitle>
          <p className="text-muted-foreground thai-text">
            กรุณาใส่รหัสที่ได้รับจาก TBAT Mock Exam Box Set
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-tbat-primary font-medium thai-text">
              รหัส Box Set
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="TBAT-XXXX-XXXX"
              className={cn(
                "text-center font-mono text-lg tracking-widest",
                error && "border-destructive animate-shake",
                isValid && "border-success"
              )}
              maxLength={13}
              autoComplete="off"
            />
          </div>
          
          {/* Loading State */}
          {isValidating && (
            <div className="flex items-center justify-center space-x-2 animate-fade-in">
              <Loader2 className="h-4 w-4 animate-spin text-tbat-primary" />
              <span className="text-sm text-muted-foreground thai-text">
                กำลังตรวจสอบรหัส...
              </span>
            </div>
          )}
          
          {/* Success State */}
          {isValid && !isValidating && (
            <Alert className="border-success bg-success/10 animate-fade-in">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success font-medium thai-text">
                รหัสถูกต้อง! กำลังเปิดฟอร์มลงทะเบียน...
              </AlertDescription>
            </Alert>
          )}
          
          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="thai-text">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground thai-text">
              หารหัสไม่เจอ? ดูที่หน้าปกในของ Box Set หรือ
              <Button variant="link" className="p-0 h-auto text-tbat-secondary underline thai-text">
                ติดต่อฝ่ายสนับสนุน
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Progress Stepper Component (Multi-Step Form)

```typescript
// components/ui/progress-stepper.tsx
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'current' | 'pending';
}

interface ProgressStepperProps {
  steps: Step[];
  className?: string;
}

export function ProgressStepper({ steps, className }: ProgressStepperProps) {
  return (
    <nav aria-label="Progress" className={cn("mb-8", className)}>
      <ol className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={cn(
            "relative",
            stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
          )}>
            {/* Connector Line */}
            {stepIdx !== steps.length - 1 && (
              <div
                className={cn(
                  "absolute inset-0 flex items-center",
                  "left-4 top-4"
                )}
                aria-hidden="true"
              >
                <div className={cn(
                  "h-0.5 w-full",
                  step.status === 'complete' ? "bg-tbat-primary" : "bg-gray-200"
                )} />
              </div>
            )}
            
            {/* Step Indicator */}
            <div className="relative flex items-start group">
              <span className="h-9 flex items-center">
                {step.status === 'complete' ? (
                  <CheckCircle className="w-8 h-8 text-tbat-primary" />
                ) : step.status === 'current' ? (
                  <Circle className="w-8 h-8 text-tbat-primary fill-tbat-primary border-2 border-tbat-primary" />
                ) : (
                  <Circle className="w-8 h-8 text-gray-300" />
                )}
              </span>
              
              {/* Step Content */}
              <span className="ml-4 min-w-0 flex flex-col">
                <span className={cn(
                  "text-sm font-medium thai-text",
                  step.status === 'complete' ? "text-tbat-primary" :
                  step.status === 'current' ? "text-tbat-primary" :
                  "text-gray-500"
                )}>
                  {step.title}
                </span>
                <span className={cn(
                  "text-sm thai-text",
                  step.status === 'current' ? "text-tbat-secondary" : "text-gray-500"
                )}>
                  {step.description}
                </span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

---

## Form Component Enhancements

### Thai-Optimized Form Components

```typescript
// components/ui/thai-form-field.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ThaiFormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'tel' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ThaiFormField({
  label,
  type = 'text',
  placeholder,
  options,
  error,
  required,
  value,
  onChange,
  className
}: ThaiFormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-tbat-primary font-medium thai-text">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {type === 'select' ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={cn(
            "thai-text",
            error && "border-destructive"
          )}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value} className="thai-text">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "thai-text",
            error && "border-destructive"
          )}
        />
      )}
      
      {error && (
        <p className="text-sm text-destructive thai-text animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
```

---

## Component Library Structure

### Package Organization

```
packages/ui/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── progress.tsx
│   ├── tbat/                  # TBAT-specific components
│   │   ├── registration-modal.tsx
│   │   ├── progress-stepper.tsx
│   │   ├── thai-form-field.tsx
│   │   └── code-input.tsx
│   └── blocks/               # Composite components
│       ├── registration-wizard.tsx
│       ├── login-form.tsx
│       └── exam-submission-form.tsx
├── styles/
│   ├── globals.css           # Variant 6 CSS variables
│   └── components.css        # Component-specific styles
├── lib/
│   ├── utils.ts             # shadcn/ui utilities
│   └── thai-utils.ts        # Thai text processing utilities
└── package.json
```

---

## Implementation Guidelines

### Development Workflow

1. **Install shadcn/ui Components**
   ```bash
   npx shadcn-ui@latest add dialog input label select progress alert
   ```

2. **Apply Variant 6 Theming**
   - Update `tailwind.config.js` with TBAT color palette
   - Configure CSS variables in `globals.css`
   - Add Google Fonts Prompt for Thai typography

3. **Build TBAT Components**
   - Extend shadcn/ui base components with Variant 6 styling
   - Create Thai-optimized form components
   - Implement registration wizard with proper accessibility

4. **Testing Integration**
   - Component visual regression testing
   - Accessibility testing with screen readers
   - Thai text rendering validation

### Quality Standards

- **Accessibility:** WCAG 2.1 AA compliance with proper Thai text support
- **Performance:** Components lazy-loaded, optimized bundle sizes
- **Consistency:** All components follow Variant 6 design system
- **Maintainability:** Clear separation between base shadcn/ui and TBAT customizations

---

## Success Metrics

- **Design Consistency:** 100% of components use Variant 6 color palette
- **Thai Typography:** Optimal rendering with Google Fonts Prompt
- **Performance:** Component bundle size under 50KB gzipped
- **Accessibility:** All form components keyboard navigable and screen reader friendly
- **User Experience:** Registration completion rate above 85% with new UI

---

*This specification ensures consistent application of the Variant 6 design system across all TBAT platform components while maintaining the flexibility and accessibility of the shadcn/ui foundation.*