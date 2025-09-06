# Accessibility Requirements

### Compliance Target

**Standard:** WCAG 2.1 AA compliance for educational accessibility

### Key Requirements

**Visual:**

- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: 2px solid primary color outline
- Text sizing: Scalable up to 200% without horizontal scrolling

**Interaction:**

- Keyboard navigation: Full site navigable without mouse
- Screen reader support: Proper ARIA labels and roles in Thai
- Touch targets: Minimum 44px tap targets for mobile

**Content:**

- Alternative text: Descriptive alt text for all images
- Heading structure: Proper H1-H6 hierarchy
- Form labels: Clear association with form controls

### Testing Strategy

- Automated testing with axe-core
- Manual keyboard navigation testing
- Screen reader testing with NVDA/JAWS
- Mobile accessibility testing on iOS/Android
- Color blindness simulation testing
