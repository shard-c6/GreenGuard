---
name: GreenGuard — The Satbara Extract
description: A public register of responsibility for planted trees, set as a Maharashtra 7/12 land extract.
colors:
  ground: "#EEF1E6"
  paper: "#F7F9F2"
  revenue-green: "#1F4D2E"
  revenue-green-lit: "#2F6B41"
  stamp-violet: "#4A2C6B"
  serial-red: "#B3261E"
  record-ink: "#14180F"
  muted-ink: "#5A6152"
  rule: "#A8B5A0"
  rule-hair: "rgba(31,77,46,.28)"
  tint-fill: "rgba(31,77,46,.045)"
typography:
  display:
    fontFamily: "Noto Sans Devanagari, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.16
    letterSpacing: "-0.015em"
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
  headline:
    fontFamily: "Noto Sans Devanagari, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Noto Sans Devanagari, ui-sans-serif, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Noto Sans Devanagari, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  body-prose:
    fontFamily: "Noto Sans Devanagari, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  column-head:
    fontFamily: "Noto Sans Devanagari, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.11em"
  serial:
    fontFamily: "Noto Sans Devanagari, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.11em"
  annotation:
    fontFamily: "Noto Sans Devanagari, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  none: "0"
spacing:
  hair: "3px"
  xs: "5px"
  sm: "7px"
  cell-y: "11px"
  cell-x: "13px"
  md: "16px"
  lg: "20px"
  xl: "26px"
  gutter: "34px"
components:
  action-bar:
    backgroundColor: "{colors.revenue-green}"
    textColor: "{colors.paper}"
    typography: "{typography.serial}"
    rounded: "{rounded.none}"
    padding: "15px"
    width: "100%"
  action-bar-hover:
    backgroundColor: "{colors.revenue-green-lit}"
    textColor: "{colors.paper}"
  action-bar-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.revenue-green}"
    rounded: "{rounded.none}"
    padding: "15px"
    width: "100%"
  decision-approve:
    backgroundColor: "transparent"
    textColor: "{colors.revenue-green}"
    rounded: "{rounded.none}"
    padding: "9px"
  decision-decline:
    backgroundColor: "transparent"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.none}"
    padding: "9px"
  extract-block:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.record-ink}"
    rounded: "{rounded.none}"
  extract-cell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.record-ink}"
    rounded: "{rounded.none}"
    padding: "11px 13px"
  extract-cell-responsible:
    backgroundColor: "{colors.tint-fill}"
    textColor: "{colors.record-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "11px 13px"
  endorsement-stamp:
    backgroundColor: "rgba(247,249,242,.72)"
    textColor: "{colors.stamp-violet}"
    rounded: "{rounded.none}"
    padding: "6px 11px 5px"
  field-box:
    backgroundColor: "transparent"
    textColor: "{colors.record-ink}"
    rounded: "{rounded.none}"
    padding: "11px"
  field-box-selected:
    backgroundColor: "rgba(31,77,46,.06)"
    textColor: "{colors.record-ink}"
    rounded: "{rounded.none}"
    padding: "12px 13px"
  printed-index-item:
    backgroundColor: "transparent"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.none}"
    padding: "11px 15px 10px"
  printed-index-item-current:
    textColor: "{colors.revenue-green}"
  synthetic-flag:
    backgroundColor: "transparent"
    textColor: "{colors.serial-red}"
    rounded: "{rounded.none}"
    padding: "2px 7px"
---

# Design System: GreenGuard — The Satbara Extract

> This file is the visual authority for the GreenGuard app and the FUTUREGREENWORLD FOUNDATION site. It supersedes **both** `design-system/greenguard-premium/MASTER.md` (sky blue #0EA5E9 / orange, Satoshi + General Sans — generated, never implemented) and the incumbent token block in `frontend/src/app/globals.css` (green #16a34a, DM Sans + Outfit). Those two never agreed with each other and neither is the shipped world. Do not reinstate either.
>
> Extracted from the shipped artifact: `.impeccable/proto/index.html` (eight hash-routed screens) and the captures in `.impeccable/review/`. A matching Figma file carries the same eight frames and a `Satbara` variable collection: https://www.figma.com/design/MONSyiJqcmXr1rUptnI2U7

## Overview

**Creative North Star: "The Satbara Extract"**

The Maharashtra 7/12 land record — the सातबारा उतारा — reissued for a single tree. A 7/12 extract is the document a family in Maharashtra already trusts to answer the only question that matters about a piece of land: who is answerable for it. This system takes that instrument literally. Every screen is a page of a register. Columns carry their names printed at the head rather than implied by position; every record carries a serial in red; endorsements arrive as a rotated violet stamp; and condition entries accumulate downward the way cultivation entries accumulate on a real extract, so a plant's history *is* the document rather than a tab beside it.

The ground is light on purpose, and the reason is the use scene, not the category. The primary user is standing outdoors in Kharghar sun, one-handed, on a phone, with a tree in front of them. A dark surface in that light becomes a mirror. So the ground is a pale security-tint form paper (#EEF1E6, with a fine 45°/-45° crosshatch at 2.2% opacity), records sit a shade brighter on it (#F7F9F2), and content is near-black revenue ink. Contrast is carried by ink-on-paper, never by glow. The same decision rules out soft shadows: a printed form has no z-axis, and nothing here needs one.

Density is documentary. The register is comfortable with a lot of true information at small size, because the alternative — three big numbers on a gradient — is exactly the category default this world refuses. Nothing is rounded. Nothing floats. The largest element on a record is not the species, not the photograph, and not a call-to-action: it is the name of the person responsible.

**Key Characteristics:**
- Printed column heads (10px, 700, .11em tracking, revenue green) above every value — never inferred from position
- Hairline rules at `rgba(31,77,46,.28)`; structural rules at solid #1F4D2E; zero radius everywhere
- A red serial number on every record, in tabular figures
- A violet endorsement stamp, rotated -4deg, as the only ornament in the system
- Light form ground chosen for outdoor legibility, not for category habit
- One typeface, Noto Sans Devanagari, across Devanagari and Latin, with `tnum`/`lnum` on at body level
- Flat by construction: no shadows, no gradients, no floating controls

## Colors

A revenue-office palette: pale form paper, deep bureaucratic green, and two inks reserved for things a clerk would have applied by hand — violet for endorsements, red for serials and alarm.

### Primary
- **Revenue Green** (`{colors.revenue-green}`): The structural ink. Every solid rule, every extract border, every printed column head, the masthead underscore, the current item in the printed index, and the fill of the primary action bar. It is the color of the form itself.
- **Revenue Green, Lit** (`{colors.revenue-green-lit}`): The only hover/confirm shift in the system. Action bars move to it on hover and rest on it after a successful file.

### Secondary
- **Stamp Violet** (`{colors.stamp-violet}`): Endorsement and state. The rotated ADOPTED / FILED stamp, the focus ring (`outline: 3px solid`, 2px offset), text selection, and the "Needs attention" condition mark in the NGO register. Violet means something was *acted upon*, never merely displayed.

### Tertiary
- **Serial Red** (`{colors.serial-red}`): Record numbers and the single most decision-relevant figure on a screen. Serials (`GG/KHR/2026/0417`), the open/unadopted count, distance-to-adopter, critical condition, the ordinal digits on condition options, open parcels on the map, and the synthetic-data flag. Red is never decorative and never a background.

### Neutral
- **Security-Tint Ground** (`{colors.ground}`): The page beneath everything, carrying a fine crosshatch at 2.2% green.
- **Form Paper** (`{colors.paper}`): Every record, phone frame, map field, and ghost action bar. One step brighter than the ground; that single step is the entire figure/field separation.
- **Record Ink** (`{colors.record-ink}`): Values, names, numbers — the content a clerk would have written in.
- **Muted Ink** (`{colors.muted-ink}`): Secondary annotation, sub-lines, prose, adopted-state labels, decline action.
- **Rule** (`{colors.rule}`): Visible-but-quiet strokes: dashed photograph placeholders, declined-action border, scrollbar thumb.
- **Rule Hair** (`{colors.rule-hair}`): The default divider between register rows and between form fields.
- **Tint Fill** (`{colors.tint-fill}`): The 4.5% green wash that marks the single most important cell on a record — the responsible party, the device-derived location. Selection raises it to 6%.

### Named Rules
**The Hand-Ink Rule.** Violet and red are reserved for marks a clerk applies, not for decoration. Violet = an endorsement or a state change. Red = a serial or the one number that decides the user's next action. If a screen shows more than one red figure per row, one of them is not load-bearing.

**The One-Step Rule.** Figure separates from field by exactly one step of paper (#F7F9F2 on #EEF1E6) plus a rule. Never by a shadow, never by a second background tint, never by a color-shifted card.

**The Named-State Rule.** Condition is a named ordered progression — Healthy / Needs attention / Critical / Did not survive, numbered 1–4 — and the word is always present. Color may reinforce a state; it may never be the only carrier. This survives bright sun and color blindness alike.

## Typography

**Single Font:** Noto Sans Devanagari (with `ui-sans-serif`, `system-ui`, `sans-serif`)

**Character:** One family across both scripts, because bilingual Marathi/Hindi rendering is a product requirement and a two-family pairing would desynchronize the two halves of a printed line. Noto Sans Devanagari's Latin is even, upright and slightly official — clerical without being a typewriter. `font-feature-settings: "tnum" 1, "lnum" 1` is set at body level, so every figure in the system is tabular and lining: serials, girths, distances and counts stack in columns without re-alignment.

### Hierarchy
- **Display** (700, 30px, 1.16, -.015em): The register's opening statement on the Foundation screen — the planted/unadopted counts stated as a sentence. One per surface, at most.
- **Headline** (700, 24px, 1.2): The number an NGO staffer opened the app to read ("119 unassigned"). Reserved for a single aggregate figure at the head of a working register.
- **Title** (700, 21px, -.01em): **The responsible party's name.** This is the largest text on a plant record and must remain so. A supporting 19px/700 red figure is permitted for distance on an application card, where distance is the decision.
- **Body** (400–600, 14.5px / 14px, 1.3–1.6): Cell values, register row names, species. 500–600 weight distinguishes a row's subject from its figures.
- **Body Prose** (400, 13.5px, 1.62, max 62ch): Explanatory paragraphs on the Foundation surface and in the register's marginal commentary.
- **Column Head** (700, 10px, .11em, uppercase, revenue green): The printed name of every column and field. Present above every value without exception.
- **Serial** (700, 12px, .11em, serial red): Record and parcel numbers, always at the top-left of the object they identify.
- **Annotation** (400, 11.5px, muted): Sub-lines under a value — dates, parcel accuracy, adoption provenance.

### Named Rules
**The Responsible-Party Rule.** On any record screen, the name of the person answerable is the largest text in the viewport. Species, location, photograph and call-to-action all sit below it. If a new screen breaks this, the screen is wrong, not the rule.

**The Printed-Head Rule.** No value appears without its column name printed above or beside it at 10px revenue-green caps. Position never implies meaning. Bilingual heads set both scripts in one line (`Responsible · कब्जेदार`).

**The Tabular-Figure Rule.** `tnum` and `lnum` stay on globally. Never override to proportional figures; columns of girths, distances and counts must align down the page.

## Layout

A single centered register page (`max-width: 1240px`, `28px 20px 80px`, tightening to `20px 14px 60px` below 620px). The desktop composition is a two-column stage — the device at its natural width beside a marginal commentary column, `34px` gutter — collapsing to one column below 900px.

Screens are either **register width** (`min(820px, 100%)`, used for the Foundation drive register) or **device width** (`min(380px, 100%)`, used for every app screen). The app screens are phone-shaped by intent, not by simulation: a 604px body that scrolls with the action bar pinned below it.

Spacing rhythm is documentary and tight: cells are `11px 13px`, form sections `13–14px`, action bars `15px`, and the gaps between stacked field groups run `7px` / `16px`. There is no 8pt grid; the rhythm comes from the cell.

Navigation is a **printed index**, not a tab bar: labels grouped under 9.5px uppercase group names (FOUNDATION / ADOPTER / NGO) separated by hairline verticals, with the current entry marked by a 2px green underscore. No icons appear in it.

### Named Rules
**The Ledger-Scroll Rule.** A ruled table never reflows its columns out of existence at narrow widths. Register tables keep a `min-width: 560px` and scroll horizontally as one object (`overflow-x: auto`), because a column that disappears takes its printed head with it.

**The Thumb-Bar Rule.** The primary action is a full-width bar at the bottom of the screen, above the fold of the hand. Never a floating circle, never a corner pill.

## Elevation & Depth

**There are no shadows in this system, at any state.** A printed form has no z-axis. Depth is conveyed by exactly three devices: one step of paper brightness (ground → record), a stroke (hairline `rgba(31,77,46,.28)` for dividers, solid #1F4D2E for structure), and a 4.5% green tint fill on the one cell that outranks its neighbours.

The single overlay in the build — the stamp confirmation — does not use a shadow either. It uses a translucent ground scrim (`rgba(238,241,230,.72)`) that fades the register back like a sheet of tracing paper laid over it, and the stamp lands on top at full opacity.

**Motion is one authored moment, not ambient response.** Filing an entry scrims the body over 260ms and lands the violet stamp from `scale(2.4)` to `scale(1)` over 420ms on `cubic-bezier(.16, 1, .3, 1)` — the arrival of a physical stamp. Action bars carry a single 180ms color transition on the same easing. `prefers-reduced-motion: reduce` collapses the stamp to an instant opacity state with zero duration. Nothing else in the system moves.

### Named Rules
**The No-Shadow Rule.** No `box-shadow`, no `filter: drop-shadow`, no blur, no glow — including on hover, focus, modals and stamps. If an element needs to separate, give it paper and a rule.

**The One-Moment Rule.** Motion appears once per flow, at the moment a record changes state, and it is authored. Hover effects, entrance staggers, parallax and ambient transitions are not part of this world.

## Shapes

Zero radius, everywhere, on everything: records, buttons, fields, stamps, map pins, flags. The form language is the ruled rectangle — a grid of cells bounded by strokes, subdivided by hairlines.

Strokes carry a fixed vocabulary of weights: `2px` solid for the endorsement stamp's border and for the masthead/index current-state underscore; `1px` solid green for a record's outer boundary, its header bar, and the confirmed/selected field; `1px` hairline for row dividers and unselected fields; `1px` dashed `{colors.rule}` for a placeholder that is waiting on the user (photograph slots).

Two silhouettes recur and both are load-bearing: the **rotated stamp** (-4deg, violet 2px border, translucent paper fill, two-line caps) and the **boxed flag** (a 1px red rectangle with 2px 7px padding around 9.5–10.5px red caps, used for synthetic-data disclosure and sample figures).

### Named Rules
**The Square-Corner Rule.** `border-radius` is `0` on every surface and control. The one exception in the build is the focus ring, which carries a `1px` radius so the violet outline reads as a drawn ring rather than a fifth border on the cell beneath it.

**The Sunlight-Target Rule.** Every interactive element clears a `44px` minimum height (`min-height: 44px` on index entries and on the `.tap` helper), and focus is a `3px` stamp-violet outline at `2px` offset — thick enough to find in direct sun. Register rows and action bars satisfy this through their own padding.

## Components

### Action Bars (primary buttons)
The instrument of commitment; it fills the width because the decision is not optional.
- **Shape:** Square (0 radius), full width, no border on the primary.
- **Primary:** Revenue green fill with paper text, `15px` padding, 13px / 700 / .07em uppercase, centered.
- **Hover:** Background shifts to Revenue Green Lit over 180ms `cubic-bezier(.16,1,.3,1)`. No lift, no shadow.
- **Ghost:** Paper fill, revenue-green text, hairline top border. Same geometry — used for the alternative route ("View on map instead", "Back to list"), never for a second primary.
- **Paired:** Two bars may sit side by side with a 1px green vertical divider, each `flex: 1` (Foundation: adopt / volunteer).

### Decision Buttons
Equal-weight named actions for irreversible choices. Approve carries a 1px revenue-green border and green caps; Decline carries a 1px `{colors.rule}` border and muted caps. Both are `9px` padding, 12px, .06em, uppercase, side by side at `flex: 1` with an `8px` gap. The asymmetry is weight (700 vs 600), not color loudness — decline is never red.

### Extract Block (signature component)
The system's defining object: a bordered record whose cells each print their own column head.
- **Border:** 1px solid revenue green; header bar separated by a second 1px green rule.
- **Header bar:** serial in red at the left, a column-head-styled classifier at the right, baseline-aligned, `9px 13px`.
- **Cells:** `11px 13px`, divided by hairlines; column head at 10px green caps, value at 14.5px with a `4px` gap.
- **Ranked cell:** the responsible party's cell takes a `{colors.tint-fill}` wash and sets its value at 21px / 700.
- **Stamp:** absolutely positioned at the block's lower right (`right: 13px; bottom: 12px`).

### Endorsement Stamp (signature component)
2px violet border, violet caps at 11px / 700 / .13em, a 9.5px 500-weight date line beneath at 85% opacity, `6px 11px 5px` padding, translucent paper fill, `rotate(-4deg)`. It is applied to records, never to controls, and never appears more than once per record.

### Condition Entry List (signature component)
Entries accumulate downward, newest first, each on a `30px / 1fr` grid: a red two-digit ordinal in the narrow column, then the named condition (13px / 600) with its date right-aligned in annotation grey, then the measurement note beneath. Separated by hairline top borders. The list is part of the record, never a separate tab or timeline view.

### Register Rows
Full-width left-aligned buttons, `13–14px 13px`, hairline-divided. Subject name at 15px / 600 with a muted sub-line; the decision figure right-aligned — distance in red 11px caps-tracked, with an OPEN (green, 700) or Adopted (muted, 400) state word beneath it. Touch target is the full row.

### Fields
Read-as-printed: a 1px hairline box at `11px` padding on paper, 14.5px value with an optional annotation sub-line. A **confirmed** field (device-derived location) upgrades to a 1px solid green border with a tint fill. A **pending** field (photograph) is a dashed `{colors.rule}` box, centered 12.5px muted text, `24–26px` padding. There are no placeholder-inside-input patterns; the column head above is the label.

### Option List (radio equivalent)
Stacked full-width boxes, `12px 13px`, `7px` apart. Unselected: hairline border, transparent, 400 weight. Selected: 1px solid green border, `rgba(31,77,46,.06)` fill, 600 weight. Each option is prefixed by its red ordinal (1–4) at 11px / 700, so the progression is ordered in words and numbers, not by position alone.

### Printed Index (navigation)
Text-only entries at 12px / 600 / .06em in muted ink, `11px 15px 10px` with a `44px` minimum height, on a hairline baseline. Current entry: revenue green with a 2px green underscore overlapping the baseline. Group labels at 9.5px / 700 / .16em green caps, separated by a hairline vertical rule. Hover darkens to record ink. No icons, no pills, no background fills.

### Map Field
A hairline graticule (47px cells, both axes) over paper — a survey sheet, not a rendered basemap. Sites are **numbered parcel labels**, not pins: a 2px-bordered box carrying the parcel serial at 10.5px / 700 caps, red bordered and red lettered when open, green when adopted.

### Synthetic-Data Flag
A 1px red rectangle with red uppercase caps at 9.5–10.5px / .09–.14em, `2px 7px`. Required on any surface showing figures that are not real, per the product's standing constraint. It is a component of this system, not a wireframe artifact.

## Do's and Don'ts

### Do:
- **Do** print every column's name above its value in 10px revenue-green caps. Position never implies meaning.
- **Do** make the responsible party's name the largest text on any record screen (21px / 700).
- **Do** give every record a serial in serial red (#B3261E) at its top-left, in tabular figures.
- **Do** separate figure from field with one step of paper plus a rule — `{colors.paper}` on `{colors.ground}`.
- **Do** name every state in words in a fixed numbered order; color only reinforces.
- **Do** pin the primary action as a full-width green bar at the bottom of the screen.
- **Do** keep `tnum`/`lnum` on globally and set both scripts in Noto Sans Devanagari.
- **Do** let ruled tables scroll horizontally as one object (`min-width: 560px`) rather than dropping columns at narrow widths.
- **Do** mark any non-real figure with the red boxed synthetic flag.
- **Do** clear a 44px minimum touch target on every control and show focus as a 3px violet outline at 2px offset.
- **Do** reserve motion for the single moment a record changes state, on `cubic-bezier(.16,1,.3,1)`, and honour `prefers-reduced-motion`.

### Don't:
- **Don't** use `box-shadow`, `drop-shadow`, blur or glow anywhere, in any state.
- **Don't** round a corner. `border-radius` is `0` system-wide.
- **Don't** use a gradient, a photographic hero, or rounded impact-stat tiles — the three devices this world was built to refuse.
- **Don't** float the primary action as a circular FAB or a corner pill.
- **Don't** build an icon tab bar. Navigation is the printed text index.
- **Don't** communicate condition or availability by color alone.
- **Don't** apply the violet stamp to a control, a nav item, or more than once per record — it endorses records only.
- **Don't** use serial red as a background fill or on a decline action; red is a serial or the deciding figure, nothing else.
- **Don't** introduce a second typeface, and don't split Devanagari and Latin across two families.
- **Don't** darken the ground. The light form paper is a legibility decision for bright outdoor use, not a style preference.
- **Don't** reinstate `design-system/greenguard-premium/MASTER.md` (#0EA5E9 + orange, Satoshi / General Sans) or the `globals.css` incumbent (#16a34a, DM Sans / Outfit). Both are superseded by this file.
