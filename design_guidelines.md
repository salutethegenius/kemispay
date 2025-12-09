# KemisPay Waitlist Landing Page Design Guidelines

## Design Approach
**Reference-Based: Modern Fintech Premium**
Drawing inspiration from Stripe's elegance, Plaid's trustworthiness, and Square's clean professionalism. The design emphasizes credibility through sophisticated simplicity, strategic whitespace, and premium visual treatment.

## Core Design Principles
1. **Breathing Luxury**: Generous spacing creates premium feel and guides focus
2. **Trust Through Clarity**: Clean hierarchy and transparent messaging build credibility
3. **Mobile-First Excellence**: Design scales beautifully from mobile to desktop

## Typography System

**Font Families** (Google Fonts):
- Primary: Inter (400, 500, 600, 700) - body text, UI elements
- Display: Plus Jakarta Sans (600, 700, 800) - headlines, hero text

**Hierarchy**:
- Hero Headline: 56px/64px (desktop), 36px/44px (mobile), weight 700
- Section Headlines: 40px/48px (desktop), 28px/36px (mobile), weight 700
- Subheadings: 24px/32px, weight 600
- Body Large: 20px/32px, weight 400
- Body: 16px/26px, weight 400
- Captions: 14px/20px, weight 500

## Layout System

**Spacing Primitives**: Tailwind units 4, 6, 8, 12, 16, 20, 24
- Component internal spacing: p-6, p-8
- Section vertical rhythm: py-20 (desktop), py-12 (mobile)
- Element gaps: gap-6, gap-8, gap-12
- Content max-width: max-w-6xl for sections, max-w-4xl for text-focused areas

## Page Structure (7 Sections)

### 1. Navigation Header
Sticky transparent-to-solid on scroll, py-4, backdrop-blur effect
- Left: KemisPay logo (wordmark + icon)
- Right: "Request Early Access" CTA button
- Mobile: Hamburger menu (minimal - logo + CTA only)

### 2. Hero Section (90vh)
Full-width background image with gradient overlay, centered content
- Hero headline + compelling subheading (max-w-3xl centered)
- Email capture form (single input + button, inline on desktop, stacked mobile)
- Social proof indicator below form: "Join 2,000+ Bahamian businesses"
- Blurred button background for CTA on image
- Subtle scroll indicator at bottom

### 3. Problem/Solution Section
Two-column layout (desktop), stacked (mobile), py-24
- Left: Problem statement with icon, headline, body text
- Right: Solution statement with icon, headline, body text
- Use medium-sized icons (48px) above text blocks

### 4. Key Features Grid
Three-column grid (desktop), single column (mobile), py-24
- Feature 1: Instant Settlements - icon, title, 2-line description
- Feature 2: Local Currency Support - icon, title, description  
- Feature 3: Advanced Security - icon, title, description
- Feature 4: Developer APIs - icon, title, description
- Feature 5: Transparent Pricing - icon, title, description
- Feature 6: 24/7 Support - icon, title, description
- Cards with subtle borders, p-8, hover lift effect

### 5. Trust & Credibility Section
Full-width, py-20, centered content
- Headline: "Built for the Bahamas"
- Grid of trust indicators (2x2 desktop, 1 column mobile):
  - "Bank-Level Security" with shield icon
  - "Locally Regulated" with checkmark icon
  - "Caribbean-First Support" with chat icon
  - "99.9% Uptime SLA" with graph icon
- Background: subtle gradient or pattern

### 6. Waitlist CTA Section
Centered, py-24, max-w-2xl
- Compelling headline: "Be First to Transform Payments"
- Subheading about early access benefits
- Email capture form (repeated, larger treatment)
- List of 3 benefits for early adopters (checkmarks)
- "No credit card required" micro-copy

### 7. Footer
Full-width, py-12, three-column desktop, stacked mobile
- Column 1: Logo, tagline, social links (LinkedIn, Twitter)
- Column 2: Quick links (About, Pricing, Docs, Contact)
- Column 3: Newsletter signup field + Privacy/Terms links
- Bottom bar: Copyright, "Made in the Bahamas" badge

## Component Library

**Buttons**:
- Primary: Rounded-lg, px-8 py-4, weight 600, shadow-lg
- Secondary: Rounded-lg, px-6 py-3, border-2, weight 600
- On images: backdrop-blur-md with semi-transparent background

**Input Fields**:
- Rounded-lg, px-4 py-3, border-2, focus ring effect
- Placeholder text weight 400, actual text weight 500

**Cards**:
- Rounded-2xl, p-8, subtle border, shadow on hover
- Transition all properties for smooth interactions

**Icons**: 
Use Heroicons (outline style for features, solid for trust badges)
Size: 32px for feature cards, 48px for trust section, 24px for lists

## Images Section

**Hero Background Image**:
- Professional business/technology aesthetic (hands using phone for payment, modern office, or abstract financial graphics)
- High quality, wide aspect ratio (16:9 or wider)
- Dark gradient overlay (bottom to top, 70% opacity) to ensure text readability
- Placement: Full background of hero section

**Optional Supporting Images**:
- Trust section background: Subtle geometric pattern or light texture
- Consider abstract illustrations for problem/solution section (minimal, line-art style)

## Animations
Minimal and purposeful:
- Hero text: Fade-in on load (800ms)
- Scroll-triggered: Fade-up for section headlines (300ms)
- Card hover: Gentle lift (transform translateY -4px, 200ms)
- Button hover: Slight scale (1.02)

**Critical**: No hero image unless specifically requested for other applications. This design includes hero image as specified.