# Violet Suite — component kit

A calm, premium SMB-fintech UI: soft violet-on-white, glassy surfaces, white
rounded cards floating on a faint violet canvas, one bold violet accent
(`#7C4DFF`), tabular numerals on money, dark-gradient hero summary cards, and
quick springy micro-animations.

**Live demo:** [`/violet`](../../app/violet/page.tsx)

## Using it

```tsx
import {
  VioletSurface, PageHeader, DarkHero, StatTile, VioletCard, VioletCardHeader,
  VTable, VTableHead, VTableHeadCell, VTableRow, VTableCell,
  VioletButton, Chip, IconChip, Avatar, Toggle, VioletInput, VioletSelect,
  Modal, Drawer, FloatingActionBar, money,
} from '@/components/violet';

<VioletSurface className="min-h-screen p-6">
  <PageHeader crumbs={[{ label: 'Dashboard' }, { label: 'Chart of Accounts' }]} title="Chart of Accounts" />
  <DarkHero label="RECEIVABLES" value={money(2342669)} caption="500 open invoices" />
</VioletSurface>;
```

> Wrap any Violet screen in `<VioletSurface>` so the Plus Jakarta Sans font and
> canvas background cascade. `Modal`/`Drawer` portal to `#modal-root` (outside
> the surface) and set `font-jakarta` themselves.

## Tokens (Tailwind)

Defined in `tailwind.config.ts`, usable anywhere:

| Kind | Classes |
|---|---|
| Accent | `bg-v-primary` (`#7C4DFF`), `hover:bg-v-primary-hover`, `text-v-primary-deep`, `bg-v-400`/`bg-v-300` |
| Tints | `bg-v-tint50` `bg-v-tint100` `bg-v-tint150`, `border-v-chip-border` |
| Ink | `text-v-ink900` `…700` `…500` `…400` `…300`, `border-v-border` |
| Surfaces | `bg-v-card` `bg-v-card-subtle` `bg-v-wash` `bg-v-wash2`, `bg-v-canvas` |
| Status | `text-v-success-fg`/`bg-v-success-bg`, `…warn…`, `…danger…`, `…rose…`, `…teal…` |
| Gradients | `bg-v-primary` `bg-v-hero` `bg-v-hero-2` |
| Shadow | `shadow-v-card` `shadow-v-btn` `shadow-v-modal` `shadow-v-hero[-amber/green/rose]` `shadow-v-bar` `shadow-v-tile-hover` |
| Radius | `rounded-v-card` (20px) `rounded-v-modal` `rounded-v-hero` `rounded-v-tile` `rounded-v-input` `rounded-v-btn` |
| Font | `font-jakarta` + always add `tabular-nums` on numbers |
| Motion | `animate-v-rise` `animate-v-pop` `animate-v-grow` (`origin-left`) `animate-v-float` `animate-v-slide` |

Runtime helpers (`tokens.ts`): `money(n)`, `initials(name)`, `avatarGradient(seed)`,
`V.gradients` / `V.orb` for dark-hero gradients and glow orbs, plus the
`VioletTone` union (`violet | success | warn | danger | rose | teal | neutral`).

## Components

`VioletSurface` · `PageHeader` / `Breadcrumb` · `DarkHero` · `StatTile` ·
`VioletCard` / `VioletCardHeader` / `VioletCardDivider` · `VTable` &
`VTableHead`/`VTableHeadCell`/`VTableRow`/`VTableCell`/`VTableEmpty` ·
`VioletButton` (primary/secondary/outline/soft/ghost/dark/danger) · `Chip` ·
`IconChip` · `Avatar` / `AvatarStack` · `Toggle` · `VioletInput` /
`VioletSelect` / `VioletTextarea` · `Modal` · `Drawer` · `FloatingActionBar`.
