# darrenedm-site

Personal site. Themed sections — cooking, games, sport, data science, DJing —
running on one shared design system, one content pipeline, one deploy.

Next.js (App Router) · TypeScript · MDX content validated with Zod · Vercel.

## The idea

Four interests presented flat read as unfocused rather than broad. So the site
frames them as one curiosity pointed in four directions — finding out how
things work, and enjoying the company on the way.

The palette is ocean, taken literally: foam and daylight at the surface, deep
water below, and the four sections as things living at different depths — deep
water, bioluminescence, reef, coral. The home page opens in the deep and the
rest of the site surfaces into light.

## How the theming works

No component names a colour, a typeface, or a motion curve. Every component
reads CSS custom properties defined in `styles/tokens.css`. A route sets one
attribute:

```tsx
<div className="world" data-world="dj">
```

…and `styles/worlds/dj.css` redefines the handful of tokens that carry
identity — accent, ground, display face, corner radius, texture, easing.
Everything inside inherits them.

The skeleton is deliberately monochrome. All colour belongs to the worlds.

**The rule that keeps it honest:** if adding a new world requires editing a
shared component, the component is wrong. Fix the primitive once.

Adding a fifth world is three steps:

1. `styles/worlds/<name>.css` — override the tokens
2. add it to `WORLDS` and `WORLD_META` in `lib/content/schema.ts`
3. `content/<name>/` — drop in MDX

No component changes. No route changes.

## Publishing

Content lives as MDX files in `content/<collection>/`. Frontmatter is validated
by Zod at build time, so a bad file **fails the build** rather than shipping a
broken page — with an error naming the file, the field and the fix.

```
content/data/my-project.mdx   →   /data/my-project
```

Set `status: draft` to keep something in version control without publishing it:
drafts render in `next dev` and are filtered out of production builds.

To publish: write the file, commit, push. That is the whole pipeline.

## "The call"

Project and essay frontmatter can carry a `call` block — the decision, the
alternative rejected, why, and what it cost. It renders as a standing section on
the page. It is the most interesting part of any technical writeup and the part
almost everyone leaves out.

## Docs

- [`docs/DESIGN.md`](docs/DESIGN.md) — the token system, the ocean descent, the
  contrast method, motion rules
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — what was chosen, what was rejected,
  and why

## Local development

```bash
npm install
npm run dev     # drafts visible
npm run build   # drafts hidden, schema enforced
```

Node 22 LTS (see `.nvmrc`).

## Domain

Absolute URLs come from `NEXT_PUBLIC_SITE_URL` via `lib/site.ts`, fed into
Next's `metadataBase`. Moving from a `vercel.app` subdomain to a real domain is
one environment variable and a redeploy — nothing hardcoded to hunt down.
