# Design system

Ocean, taken literally. Foam and daylight at the surface, deep water below, and
each section as something living at a particular depth.

## The one rule

**No component names a colour, a typeface, or a motion curve.** Every component
reads CSS custom properties. That single rule is what makes both the per-section
theming and the scroll descent work without touching component code.

Corollary: *if adding a section requires editing a shared component, the
component is wrong.* Fix the primitive once.

## Token layers

| Layer | File | Job |
|---|---|---|
| Master bus | `styles/tokens.css` | The full token set: ground, ink, type, rhythm, the four-plus-one world hues |
| Worlds | `styles/worlds/*.css` | Override ~6 tokens on `[data-world="x"]` |
| Zones | `app/globals.css` | Override the text tokens per ocean depth on `[data-zone="x"]` |

`--world` is the identity token. Unset, it falls back to the deep mid-blue.
Every accent, focus ring, hover state and link colour derives from it.

A world may override more than colour — `--display`, `--radius`, `--ease` and
`--texture` are all fair game. `dj` inverts the entire ground to near-black:
on an otherwise light site, that section should feel like the lights going down,
and it is the clearest proof the token system carries more than an accent swap.

## The descent

The home page is a stack of full-bleed `.zone` sections. Each owns a gradient
that **starts exactly where the one above it ended**, so the page reads as one
continuous body of water rather than stacked bands.

| Zone | Section | Depth | Creature |
|---|---|---|---|
| `tide` | Cooking | 0 m | Sea otter |
| `reef` | Games | 0–50 m | Sea turtle |
| `coral` | Sport | 50–200 m | Dolphin |
| `thermocline` | — | — | — |
| `deep` | Data science | 200–1000 m | Squid |
| `midnight` | DJing | 1000–4000 m | Anglerfish |
| `abyss` | Writing | 4000 m+ | Dumbo octopus |

Ordered by real ocean depth, which also happens to run most playful → most
private. To reorder, edit the `DESCENT` array in `app/page.tsx`; the gradients
re-chain from the zone definitions, but **the `--from`/`--to` pairs must be
updated to match** or the page will show visible seams.

### Why a thermocline

Mid-water tones cannot hold dark *or* light text legibly. Rather than fudge the
crossover, one band carries the entire light-to-dark transition and deliberately
contains no text. It is also the real name for that boundary layer.

### No scroll-driven JavaScript

Scrolling *is* the descent — the effect is gradients and per-zone token
overrides. Works everywhere, degrades to nothing, costs nothing at runtime. The
only client JS on the page is the depth gauge.

## Contrast method

**Check text against the worst-case end of its own gradient** — the darkest end
of a light zone, the lightest end of a dark zone. Testing only one end missed
three failures on the first pass.

Every `--ink`, `--ink-soft`, `--muted` and `--world` value clears **4.5:1**
against its zone's worst-case background. Re-run this after any palette change:

```bash
node -e '
const L=h=>{const c=h.replace("#","").match(/../g).map(x=>{const v=parseInt(x,16)/255;
  return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const R=(a,b)=>{const [x,y]=[L(a),L(b)].sort((p,q)=>q-p);return ((x+.05)/(y+.05)).toFixed(2)};
console.log(R("#04141e","#a6d1da"));
'
```

## Motion

Ambient and slow. Everything sits behind
`@media (prefers-reduced-motion: reduce)`, which disables all animation and
transition globally.

- Light shafts drift across the surface masthead (22 s).
- Creatures drift, bob and pulse behind their zones (19–31 s), at 7–14% opacity.
- Marine snow falls **only below the thermocline**, where the light has gone.
- The depth gauge reads scroll once per animation frame, never per event.

### The gauge trick

The gauge is `position: fixed` over a background that runs from near-white to
near-black, so no single colour works. It renders white with
`mix-blend-mode: difference`, which inverts it against whatever is behind it —
legible from foam to abyss without knowing where it is.

## Typography

Sans-led and tightly tracked (`letter-spacing: -0.04em` on display). The serif
is reserved for `.prose` — long-form reading is the only place presence loses to
reading distance. Mono carries small meta labels: depth marks, roles, dates.

No webfonts. System stacks only, so there is no flash and no CDN dependency.

## Creatures

`components/Creature.tsx` — flat silhouettes built from SVG primitives in
`currentColor`. Deliberately simple: they read as atmosphere at low opacity, not
as illustration. **All six live in one file so real artwork can replace them
without touching anything else.**

## Not image-led — for now

There is no photography on the site yet, so type, colour and motion carry it.
The layout is built to accept images (section heroes, an `/about` portrait) and
will get materially better when they exist.
