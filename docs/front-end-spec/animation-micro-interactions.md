# Animation & Micro-interactions

### Motion Principles

**Subtle Enhancement:** Animations should enhance usability without being distracting. Focus on smooth transitions that provide feedback and guide user attention.

### Key Animations

- **Form validation shake:** 0.5s shake animation for error states (Duration: 500ms, Easing: ease-out)
- **Button hover lift:** Subtle translateY(-2px) transform (Duration: 150ms, Easing: ease-out)
- **Toast slide-in:** Slide from right for notifications (Duration: 300ms, Easing: ease-out)
- **Loading skeletons:** Smooth shimmer effect for content loading (Duration: 1.5s, Easing: linear, infinite)
- **Page transitions:** Fade in content on navigation (Duration: 200ms, Easing: ease-in-out)
- **Progress indicators:** Step completion animations (Duration: 500ms, Easing: ease-out)

### Reduced Motion Support

- Respect `prefers-reduced-motion` media query
- Disable all animations for users who prefer reduced motion
- Maintain functionality without animation dependence
