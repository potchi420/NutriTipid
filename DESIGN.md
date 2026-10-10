# NutriTipid Prototype - Design Patterns

Living doc for anyone building UI here (human or AI). Locked decisions first,
then the working system. Last updated 2026-10-04.

## 0. Locked Decisions (do not change without the lead)

- **Palette Option 1 is locked.** Never add a hex value. Read `var(--*)` only.
- **Font is Inter only** (400/500/600/700/800). No display face, no mono face.
- **Flat, hairlines first.** Edge OR shadow, never both. Here: edge only, flat.
  No gradients, no glow, no marquee, no glass, no bounce easing.
- **No nested cards.** Dividers and dotted leaders, not boxes in boxes.

## 1. Stack and File Map

- Static only. No framework, no build step. Open HTML files directly.
- `index.html` - landing page. Loads Tailwind CDN (layout helpers only),
  `assets/css/styles.css`, `assets/js/app.js`.
- `pages/*.html` - one file per module: `login`, `signup`, `forgot-password`,
  `profiler`, `planner`, `dashboard`. Each is self-contained with inline
  `<script>` for its own mock logic. Shared theme toggle lives in
  `assets/js/theme.js`.
- `assets/css/styles.css` - tokens plus reusable globals plus landing styles.
- `assets/css/auth.css` - shared auth system (login, signup, forgot).
- `assets/css/planner.css`, `dashboard.css` - one module stylesheet each.
- `assets/img/` - `logo_tight.svg` is the live logo (`logo.svg` is unused).
- `assets/js/app.js` - landing interactions only (theme, menu, diary tabs,
  budget worksheet, solver demo, reveals, pilot form).

### Flow (mock, localStorage only)

`login` / `signup` -> `dashboard` (home). Signup detours new users through
`profiler` first; login goes straight to dashboard. `planner` and `profile`
hang off dashboard nav. Forgot stays pre-login. Keys: `nutritipid-profile`
(JSON), `nutritipid-theme` (`light` / `dark`).

### Adding a module (checklist)

1. `pages/<name>.html` + `assets/css/<name>.css` (skip the CSS file if global
   plus auth classes already cover it).
2. Stylesheet order: `styles.css`, then `auth.css` if it uses auth patterns,
   then `<name>.css` last so it wins ties.
3. Copy the `<head>` block (theme init snippet, fonts, favicon) verbatim.
4. App pages get the app header (logo, Dashboard / Planner / Profile,
   Log out) with `is-active` on the current link, plus the bottom `.tabbar`
   for phones. Auth and onboarding pages stay chromeless with a back link.
5. Mock data lives in the page script as one clearly-commented pool object.
   Nothing user-facing may say mock, prototype, or sample.

## 2. Tokens (Option 1)

Light: bg `#FFFFFF`, ink `#1A2E22`, muted `#5F6F65`, line `#E3E9E4`,
primary `#1F9D55`, primary-ink `#FFFFFF`, accent `#E8A415`,
stamp `#157A41`, soft `#F1F5F2`.

Dark (`[data-theme="dark"]`): bg `#101614`, surface `#18211C`,
ink `#EAF2EC`, muted `#9AAFA3`, line `#26332C`, primary `#34D399`,
primary-ink `#0B1510`, accent `#FBBF24`, stamp `#34D399`, soft `#151E19`.

- One functional red exists for form errors only: `#B3261E`.
- Radii: 4px controls/inputs, 6-8px cards/panels, 999px pills/tabs/badges.
  Device mock corners are the single exception, not a precedent.
- Motion: `cubic-bezier(.22,.61,.36,1)` everywhere. Quiet entrances, one
  solver-style demo beat per page max. Everything freezes under
  `prefers-reduced-motion`, and no-JS keeps the finished state.

## 3. Shared Components (in `styles.css`, reuse before inventing)

- `.btn` + `.btn-primary` (52px min-height) + `.btn-sm` (header size).
  `.text-link` for inline green links with accent underline.
- `.panel` (card), `.bar` + `.g` / `.y` fills, `.meter` (label row + bar).
- `.diary`, `.diary-tabs`, `.day-tab`, `.meal` (44-54px round thumb or dot),
  `.diary-foot`. Tabs scroll horizontally; day content swipes on touch.
- `.auth-*` (in `auth.css`): page, wrap (480px), card, label, input,
  password eye toggle, green links, divider, google button, key box,
  message states (`.is-error` red, `.is-ok` stamp green).
- `.site-header` + `.header-row` + `.header-link` + `.tabbar` (bottom phone
  nav, fixed, safe-area padded; content gets 104px bottom clearance).
- `.brand-logo` (34px, 28px under 400px) with dark-mode brighten filter.
- Theme button: sun/moon SVGs swapped by state plus Dark/Light label.
  Never icon-only ambiguity, never a meaningless colored dot.
- `.stamp` (INSIDE BUDGET style chip) with pop entrance.
- Letter dots (initials on palette colors) double as image fallback:
  thumbnails layer over dots and remove themselves on error.

## 4. Page Patterns

- **Auth** (login, signup, forgot): soft page bg, 480px column, back link,
  heavy H1, muted sub, one bordered card. Forgot runs request-key / set-key
  / done in a single card with a dashed key inbox box.
- **Onboarding** (profiler): same auth card language. Unit selects beside
  metric inputs (kg/lb, cm/ft), activity as standard multipliers
  (1.2 sedentary to 1.9 athlete). Normalize to metric before storing.
- **App home** (dashboard): date cycler, pesos-left hero beside calories-in,
  meal sections with Add buttons, macro split bar, micro RENI rows,
  bridge link into planner.
- **Planner**: solving beat (progress + rotating status lines, skipped for
  reduced motion), 7 swipeable day tabs opening Thursday, day totals,
  week spend + FNRI panels.
- **Landing sections**: H2 Sasha headings, muted standfirsts, hairline
  dividers instead of card grids, hero photo + receipt card, price board
  strip, alternating How rows, diary + swap sidekick, budget worksheet,
  pilot checklists, native-details FAQ, email CTA, footer.

## 5. Mock Conventions

- Deterministic mock data (rotating pools, fixed arrays), never random.
- Prices follow the study SRPs: ulam matrix (tinola 40, adobo 35,
  menudo 40, sinigang 45, monggo 25-35, kangkong 20, caldereta 50,
  lugaw/rice 15) plus P5 half rice. Combos derive, never hand-priced.
  Everything rounds to fives, like real carinderias.
- Unbuilt destinations: real rows with `Soon` pills, never dead links.
  Decorative buttons post product-voiced notices ("coming soon"), never
  404 and never the word mock in UI. Code comments may say mock; UI may not.
- Copy voice: plain, friendly, English. No em dashes, no emoji in UI.

## 6. Responsive Rules

- Container 1140px, 24px gutters with safe-area insets. Never override
  `.wrap` side padding with shorthand.
- Breakpoints: 900 (nav), 640 (sections), 560 (stacking), 480 (phones),
  400 (compact header). Design 360px-first for new components.
- Touch targets 36px minimum. `min-width: 0` on all grid/flex children.
- Images `max-width: 100%`, remote images carry `onerror` fallbacks.

## 7. Working Agreement

- Prototype only: no backend calls, no real auth, no real email.
- The lead owns commits and pushes. AI assistants do not run git
  commands (status/log reads excepted) without explicit say-so.
- Palette, font, and flat-hairline rules hold on every branch, including
  experiments. Revert path for any try: new files delete cleanly, touched
  files restore from `Temp\opencode` backups named per try.
