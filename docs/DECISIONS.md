# Decisions

What was chosen, what was rejected, and why. Kept because the rejected options
are the part that gets forgotten — and the part worth being able to defend.

---

## Next.js over Astro

**Chose** Next.js App Router + TypeScript.

**Rejected** Astro, which is genuinely the better-engineered answer for a pure
content site — zero JS by default, content collections built in.

**Why** "Scalable" splits four ways, and they don't all point the same place.
Astro wins on serving content fast. Next.js wins on skills recruiters recognise,
and on room to add real server-side features when the ML demos want them. The
site is a portfolio as much as a publication, so the transferable answer won.

**Cost** More JavaScript than a content site strictly needs.

---

## Files over a database or CMS

**Chose** MDX in `content/`, frontmatter validated by Zod at build time.

**Rejected** A CMS with a browser UI; a database.

**Why** Git already gives versioning, diffs, rollback and review. A bad file
fails the build with an error naming the file, the field and the fix, instead of
shipping a broken page. Publishing is: write, commit, push.

**Cost** No posting from a phone. Revisit if that becomes the actual blocker —
a git-backed editor slots in without changing the content model.

---

## One dynamic `[world]` route over four folders

**Chose** `app/[world]/` serving every section.

**Rejected** Four near-identical route folders, as originally planned.

**Why** Adding a section is now a theme file, a `WORLDS` entry and a content
folder — no route or component changes. Static routes (`/about`, `/writing`,
`/now`) take precedence over the dynamic segment, so the spine is unaffected.

---

## `/data`, not `/ml`

**Chose** Data science as the framing.

**Rejected** Machine learning, which was the original section name.

**Why** Data science is the actual role and what recruiters search for. ML reads
narrower than the work. Bracket models and TCG balance analysis sit naturally
under data and awkwardly under ML.

**Cost** Slightly less specialist-sounding. Mitigated by the work itself being
unmistakably ML. Permanent redirects `/ml/*` → `/data/*` keep old links alive.

---

## Games is design-led, not play-led

**Chose** "Making things to play."

**Why** Designing a card game is designing a system of strategic interaction
under constraints. That is the most direct expression of what the site is about,
and it was previously mis-framed as a hobby section. Schema leads with design
fields and keeps the playing fields for entries that want them.

---

## The descent, and no scroll-driven JavaScript

**Chose** Stacked full-bleed zones, each with a gradient chained to the last and
its own text tokens.

**Rejected** CSS `animation-timeline: scroll()` (uneven browser support); a JS
scroll handler driving a colour interpolation (more code, more to break, no
better result).

**Why** Scrolling already is the descent. Works in every browser, degrades to
nothing, costs nothing at runtime.

**Cost** Zone boundaries are hand-chained — reordering sections means updating
the `--from`/`--to` pairs or you get seams.

---

## Sections are limited on purpose

**Chose** Six sections. Film, food-as-reviews and animals were deliberately not
given their own.

**Why** The architecture makes a new section nearly free, which is exactly the
danger. Empty rooms read as abandoned, not broad. Cooking earned one only when
real work existed behind it.

**Where the rest went** Cats and the dinosaur phase to `/about`; film and food
to `/writing` with tags.

---

## Placeholders are visible on purpose

**Chose** Unfilled values render as `class="todo"` — coloured and underlined.

**Rejected** Hiding them, or inventing plausible values.

**Why** Invented metrics are the worst possible outcome on a portfolio site:
they would have to be un-learned before an interview. Visible gaps nag; hidden
ones ship.

---

## Dark `/dj` on a light site

**Chose** The `dj` world inverts the whole ground.

**Why** On an otherwise light, airy site, that section should feel like the
lights going down. It is also the strongest demonstration that the token system
carries more than an accent swap — same components, different world.

---

## Open

- **Domain** — `darrenedm.com` available, unbought. `NEXT_PUBLIC_SITE_URL` means
  the swap is one env var.
- **Push-to-deploy** — not wired; needs the Vercel GitHub App authorised in a
  browser. Deploys are manual until then.
- **Light/dark toggle** — none. The site commits to one light-to-dark journey.
- **Photography** — none yet. The layout is built for it.
- **Voice** — hero, `/about`, `/now` and the zone blurbs are drafted, not
  Darren's own words yet.
