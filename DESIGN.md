---
name: GreenGuard
description: A field-first green platform for adopting and keeping alive a specific planted tree.
colors:
  gg-green: "#16a34a"
  gg-green-light: "#22c55e"
  gg-green-dark: "#15803d"
  gg-emerald: "#059669"
  gg-lime: "#65a30d"
  background: "#fafbfc"
  foreground: "#0f172a"
  card: "#ffffff"
  secondary: "#f1f5f9"
  muted-foreground: "#64748b"
  accent: "#ecfdf5"
  accent-foreground: "#065f46"
  border: "#e2e8f0"
  destructive: "#ef4444"
  night-ground: "#011d16"
  night-surface: "#022c22"
  night-deep: "#00140e"
  night-primary: "#10b981"
  night-ring: "#34d399"
  night-foreground: "#ecfdf5"
typography:
  display:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Outfit, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  sm: "0.45rem"
  md: "0.6rem"
  lg: "0.75rem"
  xl: "1.05rem"
  2xl: "1.35rem"
  pill: "999px"
  night-panel: "60px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1.25rem"
  xl: "1.5rem"
  2xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.gg-green}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1.25rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.gg-emerald}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1.25rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1.25rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1.25rem"
  button-danger:
    backgroundColor: "{colors.destructive}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "0.625rem 1.25rem"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "1.25rem"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0.6875rem 0.875rem"
  badge:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.pill}"
    padding: "0.2rem 0.6rem"
    typography: "{typography.label}"
  stat-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "1.25rem"
  night-cta:
    backgroundColor: "{colors.night-primary}"
    textColor: "{colors.night-ground}"
    rounded: "{rounded.pill}"
    padding: "1.25rem 3rem"
---

# Design System: GreenGuard

> **Authority note.** This file is derived from the shipped frontend in `frontend/src/`, principally
> `frontend/src/app/globals.css` (the `:root`, `.dark` and `@theme inline` blocks) and
> `frontend/src/app/layout.tsx`. Where any other document disagrees, this file and the code win.
>
> `design-system/greenguard-premium/MASTER.md` is **superseded**. It asserts a sky-blue (`#0EA5E9`) and
> orange palette with Satoshi and General Sans. None of that was ever implemented: the build renders a
> green family on a near-white ground in DM Sans and Outfit. MASTER.md is a generated artefact that
> never touched the product and **must not be reinstated** as a source of visual truth.
>
> A replacement visual world (the "Satbara Extract" direction) was explored in
> `docs/explorations/satbara-extract/` and **deliberately not adopted**. It has no authority here and the
> question is closed.

## Overview

**Creative North Star: "The Living Plot"**

GreenGuard looks like a field record that happens to be beautiful. Its base state is a bright, almost
paper-white working surface (`#fafbfc`) carrying white cards, hairline slate borders and a single green
family that does all the signalling. That register exists for the defining scene in PRODUCT.md: someone
standing outdoors next to a tree, one hand on the phone, in direct sun. High ground luminance, dark slate
text, and generously rounded white cards survive glare better than any tinted or low-contrast alternative,
and that is why the palette is what it is.

The build carries a **second, deliberate register**: the public and unauthenticated surfaces — the landing
story, the auth cards, the role selector — run nocturnal. Deep forest grounds (`#011d16`, `#022c22`,
`#00140e`), 40–60px radii, emerald glows and heavy display weights. This is not drift; it is reused
consistently across `app/page.tsx`, `components/landing/AnimatedStory.tsx` and the `.auth-page` / `.auth-card`
rules, and it is the register a visitor meets before they have an account. The app itself never uses it.
Dark mode (`next-themes`, class strategy) brings the app surfaces toward the same forest family, so the two
registers share a hue and differ in luminance and scale, not in identity.

Density is moderate and mobile-first: a 1280px max container, a card grid that reflows at 300px minimum,
and a hard collapse to single column at 768px. Layouts are built to absorb longer strings — Marathi and
Hindi labels run longer than English — so nothing is sized to an English word count and truncation is used
only where a value is genuinely disposable (the navbar profile name).

**Key Characteristics:**
- Bright working ground, white cards, one green accent family
- Glass and blur used as atmosphere, never as the only thing separating two things
- Generous corner radius scaled from a single `--radius` of 0.75rem
- Two registers: bright app, nocturnal public surfaces
- Motion is ambient and slow, not informative

## Colors

A single green family carries every affirmative signal against a cool slate neutral scale; everything else
is status semantics borrowed from a conventional traffic-light set.

### Primary
- **Guard Green** (`#16a34a`): the product's voice. Primary buttons, focus rings, active nav, the notification
  dot, link hovers, spinner head, and the map's own accent. It is set as `--primary` and `--ring` at once, so
  the accent and the focus signal are literally the same colour.
- **Deep Emerald** (`#059669`): the second stop of every green gradient — avatars, primary buttons, the
  logo mark. Never used alone as a flat fill in the light register.
- **Leaf Light** (`#22c55e`) and **Forest** (`#15803d`): declared in `:root` and available; used sparingly for
  illustration and hover depth rather than as UI surfaces.

### Secondary
- **Mint Wash** (`#ecfdf5`): the quiet green. Active nav pill, unread notification rows, drag-over upload
  zone, admin table row hover. It is how the system says "this one" without shouting.
- **Mint Ink** (`#065f46`): the only text colour used on Mint Wash, including role chips and primary badges.

### Tertiary
- **Night Ground** (`#011d16`), **Night Surface** (`#022c22`), **Night Deep** (`#00140e`): the nocturnal
  register's three grounds, used on the landing story, the stats band and the auth page.
- **Signal Emerald** (`#10b981`) and **Light Emerald** (`#34d399`): the accent and ring of the dark register
  and of dark mode. `#10b981` is also the PWA `theme-color` in `layout.tsx`.

### Neutral
- **Paper** (`#fafbfc`): the app ground. Slightly cooler and dimmer than pure white so white cards read as
  objects on it.
- **Card White** (`#ffffff`): every card, popover, input and dropdown in the light register.
- **Slate Ink** (`#0f172a`): all primary text.
- **Slate Mute** (`#64748b`): secondary text, labels, inactive nav, timestamps, table headers.
- **Wash** (`#f1f5f9`): secondary button fill, muted hover, tab track, skeleton base.
- **Hairline** (`#e2e8f0`): every border, divider and input stroke in the light register.
- **Alarm Red** (`#ef4444`): destructive actions, form errors, the unread-count badge, the "liked" state.

### Named Rules
**The One Green Rule.** Affirmative meaning is carried by the green family and nothing else. Blue, amber,
violet and pink exist only inside the chart scale and inside status semantics that already carry a text
label. Do not introduce a second brand accent.

**The Accent-Equals-Focus Rule.** `--ring` and `--primary` are the same value by design. A focus ring is
therefore always recognisably the product's own green; never override a focus ring to a neutral.

**The Never-Colour-Only Rule.** Plant health, adoption status and role are semantic, and every semantic
colour must ship with a word or a shape beside it. The `Badge` component honours this (it renders the
status text). Surfaces that fail it are listed in Do's and Don'ts and are defects, not licence.

## Typography

**Display Font:** Outfit (with `ui-sans-serif, system-ui, sans-serif`), bound to `--font-outfit` in
`layout.tsx` and applied to every `h1`–`h6` and `.font-heading` in `globals.css`.
**Body Font:** DM Sans (with `ui-sans-serif, system-ui, sans-serif`), bound to `--font-dm-sans` and set on
`body` as `--font-sans`.

**Character:** Outfit is geometric, wide-apertured and comfortable at heavy weights, which is why headings
run 800–900 with negative tracking; DM Sans is a low-contrast humanist face that stays legible at 0.75rem
in sun. The pairing is plain and structural rather than expressive — the photographs of plants are the
decoration.

### Hierarchy
- **Display** (900, ~3rem and above, tight leading): landing and auth headlines only, in the nocturnal
  register. Paired with `tracking-tight`.
- **Headline** (800, 1.75rem, `-0.03em`): `.page-title` and `.stat-card-value`. Drops to 1.375rem below 768px —
  the only type step that responds to viewport.
- **Title** (650, 1.05rem): `.card-title`. The 650 weight is deliberate and real; it is the system's one
  variable-weight nicety.
- **Body** (400, 0.875rem, 1.6): card text, form inputs, table cells, post content (0.9rem). Keep prose
  columns near 65ch; `.empty-state-desc` caps at 360px for the same reason.
- **Label** (600, 0.75rem, `0.05em`, uppercase): `.stat-card-label`, table headers, `.dropdown-role`, and the
  `.badge` family (0.7rem, `0.04em`). Uppercase is reserved for labels that name a value or a state.

### Named Rules
**The Two-Face Rule.** Outfit sets headings, DM Sans sets everything else. There is no third face and no
system-UI display fallback in normal operation.

**The Uppercase-Is-A-Label Rule.** Letterspaced uppercase marks a data label, a table column or a status
chip. It is never used for standalone editorial lines above a heading.

## Layout

The app runs a centred 1280px container with 1.5rem gutters and 2rem vertical padding (`page-container`),
under a 64px sticky navbar; `main-content` is sized `calc(100vh - 64px)` and the map fills that same
figure exactly. Card grids are `auto-fill, minmax(300px, 1fr)` at 1.5rem gap — the 300px floor is what keeps
a plant card readable one-handed. Fixed grids (`grid-2`, `grid-3`, `grid-4`, 1.25–1.5rem gaps) all collapse
to a single column at the one breakpoint that matters, **768px**, where the navbar also swaps its link row
for a hamburger sheet and the profile name disappears.

Spacing rhythm is a 0.25rem step used loosely: 0.25 / 0.5 / 0.75 / 1.25 / 1.5 / 2rem. Card interiors are
1.25rem; page sections separate by 2rem; form groups stack at 0.375rem internal, 1rem external. The
nocturnal register uses a much larger rhythm (py-24 to py-32, p-10 to p-16) because it is read at arm's
length rather than in the field.

## Elevation & Depth

Hybrid, and tilted toward tone. At rest, app surfaces are flat: a white card on paper ground with a 1px
hairline border does the separation work. Shadow is a **response**, not a property — cards gain a 40px
diffuse shadow plus a faint emerald bloom and lift 4px on hover; primary buttons deepen their green glow
and lift 1px. Frosted glass (`backdrop-filter: blur(20–40px) saturate(140–160%)`) runs under the navbar,
`.glass-card`, `.glass-panel` and the auth card, always behind a real border so the edge survives when the
blur does not.

### Shadow Vocabulary
- **Navbar rest** (`box-shadow: 0 4px 30px rgba(0,0,0,0.03)`): barely-there separation under the sticky bar.
- **Card hover** (`box-shadow: 0 12px 40px rgba(0,0,0,0.08), 0 0 20px rgba(16,185,129,0.05)`): the signature lift.
- **Primary button rest / hover** (`0 2px 8px rgba(22,163,74,0.3)` → `0 4px 16px rgba(22,163,74,0.4)`): the green
  glow that makes the primary action findable in sun.
- **Dropdown** (`0 10px 40px rgba(0,0,0,0.12)`): menus and popovers.
- **Focus ring** (`0 0 0 3px rgba(22,163,74,0.12)` on inputs; `0 0 0 4px rgba(52,211,153,0.2)` in the auth card).
- **Auth card** (`0 40px 100px rgba(0,0,0,0.75), inset 0 1px 1px rgba(255,255,255,0.05)`): the nocturnal register's
  single deep drop, with an inner light edge.

### Named Rules
**The Flat-At-Rest Rule.** Every app surface is flat until touched. If a component needs a shadow to be
found in its default state, it needs a border or a background instead.

**The Glass-Needs-An-Edge Rule.** Any blurred surface carries a 1px border. Blur alone is not a boundary,
and in bright outdoor light it is no boundary at all.

## Shapes

One radius token drives everything: `--radius: 0.75rem`, multiplied into a scale (`sm` ×0.6, `md` ×0.8,
`lg` ×1, `xl` ×1.4, `2xl` ×1.8, up to `4xl` ×2.6). Buttons, inputs, nav pills and dropdown items take the
base `lg`; cards, stat cards, post cards, tables and upload zones take `xl` (1.05rem); large glass panels
take `2xl`. Fully round (`999px` / `50%`) is reserved for things that are conceptually a token or a person:
badges, the notification count, avatars, the notification dot, map markers.

Borders are 1px hairlines almost everywhere; 1.5px where the border *is* the control (inputs, outline
buttons); 2px dashed on the image-upload zone, which is the only dashed edge in the system.

The nocturnal register breaks the scale on purpose, using literal 24px, 40px and 60px radii on story
panels, the auth card and role options. Those values are that register's own language and do not
propagate into app surfaces.

## Components

### Buttons
- **Shape:** softly rounded (`0.75rem`); pill only in the nocturnal register.
- **Primary:** a 135° green-to-emerald gradient with white text and a green glow, 0.625rem × 1.25rem,
  weight 600, 0.875rem. Sizes `sm` (0.375/0.875rem), `lg` (0.75/1.75rem), `icon` (0.5rem square).
- **Hover / Focus:** 0.2s ease; shadow deepens and the button lifts 1px. Disabled drops to 0.6 opacity
  and cancels the lift.
- **Secondary / Ghost / Outline / Danger:** wash fill; transparent with muted text; transparent with a
  1.5px hairline; flat `#ef4444` with white text. Ghost is the default for back links and toolbar actions.
- Note: a second, shadcn/base-ui `Button` (`components/ui/button.tsx`, `cva` variants, flat `bg-primary`,
  `h-8` default) coexists with the `.btn` CSS family. `.btn` is the incumbent and the one the app actually
  uses; treat the `cva` button as the shadcn-compatibility surface, not as a competing standard.

### Chips / Badges
- **Style:** pill, uppercase, 0.7rem / 600 / `0.04em`, tinted background with a matching dark ink —
  success `#dcfce7`/`#166534`, warning `#fef9c3`/`#854d0e`, danger `#fee2e2`/`#991b1b`, info `#dbeafe`/`#1e40af`,
  neutral `#f1f5f9`/`#475569`, primary `#ecfdf5`/`#065f46`.
- **State:** `Badge` maps domain status (plant status, plant health, adoption status, NGO status, role) to a
  variant and **always renders the humanised status text**. That text is what keeps the chip legible for a
  colourblind adopter; never render the chip as a bare dot.

### Cards / Containers
- **Corner Style:** 1.05rem (`xl`).
- **Background:** white on paper; `.glass-card` at 45% white with blur for atmospheric surfaces.
- **Shadow Strategy:** flat at rest, lift-and-glow on hover (see Elevation).
- **Border:** 1px hairline, shifting to primary green on hover.
- **Internal Padding:** 1.25rem; media fills edge-to-edge at 200px with `object-fit: cover`.

### Inputs / Fields
- **Style:** white fill, 1.5px hairline stroke, 0.75rem radius, 0.6875rem × 0.875rem, 0.875rem text, full width.
  Labels sit above at 0.8rem / 600. Textareas are vertical-resize only with a 100px floor.
- **Focus:** border turns Guard Green and a 3px 12%-opacity green halo appears. No outline.
- **Error:** 0.75rem red helper text under the field; form-level errors use a `#fee2e2` / `#991b1b` block.
- **Auth override:** inside `.auth-card`, inputs invert to 5%-white fill, 16px radius, 1rem × 1.25rem padding
  and an emerald focus halo — the only sanctioned input variant.

### Navigation
- Sticky 64px bar, card background with 24px blur and a hairline bottom edge. Links are 0.875rem / 500
  muted-slate pills; hover fills with wash; **active is Mint Wash fill with Guard Green text**. The bell
  carries an 18px red count badge. The profile trigger shows a 32px gradient avatar and a name that
  truncates at 120px. Below 768px the link row is replaced by a hamburger-toggled column beneath the bar.

### Toasts
Sonner, mounted once in `layout.tsx` at `position="top-right"` with `richColors`, `theme="system"` and
`closeButton`. Sonner's own rich-colour styling is accepted as-is; it is the only place in the product
where a surface is not styled from these tokens. Toasts confirm and report — success, info, error — and
never carry an action the user must find.

### Ambient Background
`ImmersiveBackground` fixes four blurred Lucide leaf/sprout glyphs at 15%/5% emerald opacity behind the
app at 40% container opacity, drifting on 18–30s linear loops, over two 4%-opacity green radial gradients.
It is suppressed on the landing page, map, and all auth routes. `AtmosphericBackground` plays the same role
in the nocturnal register. Framer Motion is used for exactly this class of work plus section reveals
(`whileInView`, staggered delays) and panel enter/exit — it is never load-bearing for meaning.

### Empty State
Centred column, 3rem × 2rem padding, a 3rem icon at 0.6 opacity, a 1.125rem / 700 title, a 0.875rem muted
description capped at 360px, and an optional action button. Used on plants, feed, notifications, bookmarks,
adoptions, reports, my-garden and NGO applications.

## Do's and Don'ts

### Do:
- **Do** build on the green tokens in `globals.css` (`--gg-green` `#16a34a`, `--gg-emerald` `#059669`) and the
  paper/slate neutrals. They are the shipped truth.
- **Do** derive every corner from `--radius` (0.75rem) via the `radius-sm…4xl` scale rather than typing a
  literal px radius on an app surface.
- **Do** pair every status colour with its word — the `Badge` component already does this; reuse it instead
  of hand-rolling a coloured dot or a tinted row.
- **Do** keep surfaces flat at rest and spend shadow on hover, focus and elevation only.
- **Do** give any blurred/glass surface a 1px border so it holds an edge in bright sun.
- **Do** size text and controls for one-handed outdoor use, and let labels wrap: Marathi and Hindi strings
  run longer than the English they replace.
- **Do** collapse multi-column grids at 768px, the system's single real breakpoint.
- **Do** capture geography with the draggable map pin pattern used in `dashboard/ngo/plants/new` — it sets
  latitude and longitude from a pin or from device geolocation, and the submit button stays disabled until
  coordinates exist.

### Don't:
- **Don't** reinstate the `MASTER.md` palette or type pairing. Sky blue `#0EA5E9`, orange, Satoshi and
  General Sans are not this product's system and never were.
- **Don't** introduce a second brand accent. Blue, amber, violet and pink are status and chart values only.
- **Don't** carry plant health, adoption status or any other semantic state by colour alone.
- **Don't** put a letterspaced uppercase editorial line above a heading as decoration. Uppercase marks a
  data label or a status chip; the landing page's existing instances are a defect, not a pattern.
- **Don't** use emoji or unicode glyphs as interface icons. Lucide SVG is the icon system (25 modules use it);
  a few date and calendar emoji survive in the plant detail page and should be replaced, not copied.
- **Don't** ship fabricated numbers on public surfaces. PRODUCT.md is explicit that the platform has never
  served a real user; the landing stats band currently violates this.
- **Don't** let the nocturnal register's 40–60px radii, `font-black` display weights or pill CTAs leak into
  authenticated app surfaces, or the app register's white cards leak into the landing story.
- **Don't** add `!important` overrides in the dark-mode block to patch a component that should have used
  tokens in the first place; that block is already carrying more repair work than it should.
